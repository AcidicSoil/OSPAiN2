const assert = require('assert');
const vscode = require('vscode');

suite('Cody Extension Test Suite', () => {
  vscode.window.showInformationMessage('Starting Cody tests');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('cody-vscode'));
  });

  test('Should register commands', async () => {
    // Get the list of all available commands
    const commands = await vscode.commands.getCommands();

    // Check that our commands are registered
    assert.ok(commands.includes('cody.startChat'));
    assert.ok(commands.includes('cody.processSelection'));
    assert.ok(commands.includes('cody.switchMode'));
    assert.ok(commands.includes('cody.quickPrompt'));
    assert.ok(commands.includes('cody.createRulePreset'));
    assert.ok(commands.includes('cody.manageRulePresets'));
  });
});
