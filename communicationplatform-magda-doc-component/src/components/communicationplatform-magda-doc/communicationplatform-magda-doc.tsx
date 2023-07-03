import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'communicationplatform-magda-doc',
  styleUrl: 'communicationplatform-magda-doc.css',
  shadow: true,
})
export class CommunicationplatformMagdaDoc {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
