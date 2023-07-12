import { newSpecPage } from '@stencil/core/testing';
import { CommunicationplatformTable } from '../communicationplatform-table';

describe('communicationplatform-magda-doc', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CommunicationplatformTable],
      html: `<communicationplatform-table></communicationplatform-table>`,
    });
    expect(page.root).toEqualHtml(`
      <communicationplatform-table>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </communicationplatform-table>
    `);
  });
});
