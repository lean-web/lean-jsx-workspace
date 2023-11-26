interface HeaderMenu {
    name: string;
    address?: {
        street: string;
        zip: string;
    };
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        // we override the IntinsicElements interface to include the web component dynamic-component
        interface IntrinsicElements extends SXL.IntrinsicElements {
            "header-menu": SXL.IntrinsicDynamicComponent<HeaderMenu>;
        }
    }
}

export {};
