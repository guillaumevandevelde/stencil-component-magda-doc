import { newE2EPage } from '@stencil/core/testing';

describe('communicationplatform-table', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<communicationplatform-table></communicationplatform-table>');

    const element = await page.find('communicationplatform-table');
    expect(element).toHaveClass('hydrated');
  });
});
