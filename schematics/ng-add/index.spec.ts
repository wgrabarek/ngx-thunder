import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { getWorkspace } from '@schematics/angular/utility/config';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { expect } from 'chai';

const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '8.0.0',
};

const appOptions: ApplicationOptions = {
  name: 'TestApp',
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  style: Style.Css,
  skipTests: false,
  skipPackageJson: false,
};

describe('ng add schematic', () => {
  let appTree: UnitTestTree;
  const runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));

  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree)
      .toPromise();
  });

  it('should fail with empty tree', async () => {
    const result = await runner
      .runSchematicAsync('ng-add', { project: appOptions.name }, Tree.empty())
      .toPromise()
      .catch(e => e);
    expect(result instanceof Error).eq(true);
  });

  it('should failed with no ops', async () => {
    const result = await runner
      .runSchematicAsync('ng-add', null, appTree)
      .toPromise()
      .catch(e => e);
    expect(result instanceof Error).eq(true);
  });

  it('should contain angular.json', async () => {
    const tree = await runner.runSchematicAsync('ng-add', { project: appOptions.name }, appTree).toPromise();

    expect(tree.files).to.deep.include('/angular.json');
  });

  it('should have builder installed', async () => {
    const tree = await runner.runSchematicAsync('ng-add', { project: appOptions.name }, appTree).toPromise();
    const workspace = getWorkspace(tree);

    expect(workspace?.projects[appOptions.name]?.architect?.test?.builder).equal('ngx-thunder:karma');
  });
});
