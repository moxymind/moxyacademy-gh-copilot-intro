import { execFileSync } from 'node:child_process';

async function readStdin() {
  let input = '';

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  return input;
}

async function readPayload() {
  try {
    const input = await readStdin();
    return JSON.parse(input || '{}');
  } catch {
    return {};
  }
}

function getChangedFile(toolInput) {
  if (typeof toolInput?.filePath === 'string') {
    return toolInput.filePath;
  }

  if (Array.isArray(toolInput?.filePaths) && typeof toolInput.filePaths[0] === 'string') {
    return toolInput.filePaths[0];
  }

  if (Array.isArray(toolInput?.files) && typeof toolInput.files[0] === 'string') {
    return toolInput.files[0];
  }

  if (typeof toolInput?.input === 'string') {
    const match = toolInput.input.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/m);
    if (match) {
      return match[1].trim();
    }
  }

  return '';
}

function isEditTool(toolName) {
  return /apply_patch|edit|write|create|replace/i.test(toolName);
}

function output(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

const payload = await readPayload();
const toolName = payload.tool_name || '';
const changedFile = getChangedFile(payload.tool_input);

if (!isEditTool(toolName) || !/(^|\/)(pages|tests)\//.test(changedFile)) {
  output({ continue: true });
  process.exit(0);
}

try {
  execFileSync('npm', ['test', '--', '--grep', 'successful login'], {
    cwd: payload.cwd || process.cwd(),
    stdio: 'pipe',
    encoding: 'utf8'
  });

  output({
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: 'Post-edit login smoke check passed.'
    }
  });
} catch (error) {
  const outputText = [error.stdout, error.stderr]
    .filter(Boolean)
    .join('\n')
    .trim()
    .split('\n')
    .slice(-20)
    .join('\n');

  output({
    decision: 'block',
    reason: 'Post-edit login smoke check failed.',
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: outputText || 'No test output was captured.'
    }
  });
}