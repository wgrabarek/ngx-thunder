import { tags } from '@angular-devkit/core';
import { expect } from 'chai';
import * as dedent from 'dedent';

import { compile } from '../utils/compiler_host';

describe('base', () => {
  it('should compile', () => {
    const source = dedent`
      let x: number = 1;
    `;
    const expected = dedent`
      let x = 1;
    `;
    const output = compile(source, _ => __ => node => node);

    expect(tags.oneLine`${output.code}`, output.diagnostics).equal(tags.oneLine`${expected}`);
  });
});
