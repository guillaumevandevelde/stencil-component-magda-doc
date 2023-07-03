import { newE2EPage } from '@stencil/core/testing';

describe('communicationplatform-magda-doc', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<communicationplatform-magda-doc></communicationplatform-magda-doc>');

    const element = await page.find('communicationplatform-magda-doc');
    expect(element).toHaveClass('hydrated');
  });
});
