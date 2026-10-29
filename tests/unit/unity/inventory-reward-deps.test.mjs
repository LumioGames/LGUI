import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateProjectTypes} from '../../../plugin/tools/lib/generate/index.mjs';

const example = fileURLToPath(new URL('../../../examples/inventory', import.meta.url));

test('inventory Reward declares Bag through its visible reusable icon component', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgui-reward-deps-'));
  fs.cpSync(path.join(example, 'ui'), path.join(root, 'ui'), {recursive: true});
  const {deps} = await generateProjectTypes(root);
  assert.deepEqual(deps.Reward, ['Bag', 'Common'], 'opening Reward directly from camp must load the actual Bag image owner');
  const reward = JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/headless/Reward.json'), 'utf8'));
  const dialog = reward.components.find(component => component.name === 'Reward/RewardDialog');
  const icon = dialog.children.find(child => child.name === 'icon');
  assert.equal(icon.kind, 'component');
  assert.equal(icon.ref, 'Bag/ItemIcon');
  assert.deepEqual(icon.rect, [860, 320, 200, 200]);
  assert.notEqual(icon.props.visible, false, 'the dependency must be the visible reward image, not a hidden reference');
  const bag = JSON.parse(fs.readFileSync(path.join(root, '.lgui/build/headless/Bag.json'), 'utf8'));
  const reusable = bag.components.find(component => component.name === 'Bag/ItemIcon');
  assert.equal(reusable.exported, true, 'cross-package UI references use exported components');
  assert.deepEqual(reusable.size, [200, 200]);
  assert.notEqual(reusable.extension, 'Button', 'an image container must remain an ordinary component');
  assert.deepEqual(reusable.children.map(child => [child.name, child.kind]), [['image', 'loader']]);
  assert.deepEqual(reusable.children[0].rect, [0, 0, 200, 200]);
  const types = fs.readFileSync(path.join(root, '.lgui/build/types/Reward.d.ts'), 'utf8');
  assert.match(types, /icon: UIComponent<'Bag\/ItemIcon'>/);
  assert.match(fs.readFileSync(path.join(root, '.lgui/build/types/Bag.d.ts'), 'utf8'), /export interface ItemIconUI/);
});
