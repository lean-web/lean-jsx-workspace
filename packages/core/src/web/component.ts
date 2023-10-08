export interface DynamicDataComponent extends Partial<HTMLElement> {
    "data-id": string;
}

export class DynamicComponent
    extends HTMLElement
    implements DynamicDataComponent
{
    "data-id": string;

    isLoading = false;

    static get observedAttributes() {
        return ["data-id"];
    }

    constructor() {
        super();
        // this.attachShadow({ mode: "open" });
        // if (this.shadowRoot) {
        // this.innerHTML = `
        //         <div id="data-container">
        //           ${this.innerHTML}
        //         </div>
        //       `;
        // }
    }

    connectedCallback() {
        this.innerHTML = `
            <div id="data-container">
              ${this.innerHTML}
            </div>
          `;
        if (this.isLoading) {
            return;
        }
        const dataId = this.getAttribute("data-id");
        this.isLoading = true;
        void fetch(`/components/${dataId}`)
            .then((response) => response.text())
            .then((data) => {
                const div = document.createElement("div");
                div.innerHTML = data;
                const renderedContent = div.querySelector("template");

                const container = this?.querySelector("#data-container");
                // TODO: Handle failures
                if (container) {
                    container.innerHTML = renderedContent?.innerHTML ?? "";
                }
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "data-id" && oldValue !== newValue) {
            this.connectedCallback();
        }
    }

    static register() {
        console.debug("Registering dynamic component...");
        if (!customElements.get("dynamic-component")) {
            customElements.define("dynamic-component", DynamicComponent);
        }
    }
}
