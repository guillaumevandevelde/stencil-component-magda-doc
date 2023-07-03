import { newSpecPage } from '@stencil/core/testing';
import { CommunicationplatformMagdaDoc } from '../communicationplatform-magda-doc';

describe('communicationplatform-magda-doc', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CommunicationplatformMagdaDoc],
      html: `<communicationplatform-magda-doc></communicationplatform-magda-doc>`,
    });
    expect(page.root).toEqualHtml(`
      <communicationplatform-magda-doc>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </communicationplatform-magda-doc>
    `);
  });
});
