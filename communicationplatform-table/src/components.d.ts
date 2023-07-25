/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface CommunicationplatformTable {
        "apiurl": string;
        "columns": string;
        "filters": string;
        "limitqueryparameter": string;
        "offsetqueryparameter": string;
        "totalparameter": string;
    }
}
declare global {
    interface HTMLCommunicationplatformTableElement extends Components.CommunicationplatformTable, HTMLStencilElement {
    }
    var HTMLCommunicationplatformTableElement: {
        prototype: HTMLCommunicationplatformTableElement;
        new (): HTMLCommunicationplatformTableElement;
    };
    interface HTMLElementTagNameMap {
        "communicationplatform-table": HTMLCommunicationplatformTableElement;
    }
}
declare namespace LocalJSX {
    interface CommunicationplatformTable {
        "apiurl": string;
        "columns"?: string;
        "filters"?: string;
        "limitqueryparameter"?: string;
        "offsetqueryparameter"?: string;
        "totalparameter"?: string;
    }
    interface IntrinsicElements {
        "communicationplatform-table": CommunicationplatformTable;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "communicationplatform-table": LocalJSX.CommunicationplatformTable & JSXBase.HTMLAttributes<HTMLCommunicationplatformTableElement>;
        }
    }
}
