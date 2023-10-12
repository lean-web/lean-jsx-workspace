/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    JSXElement3,
    processJSX,
} from "../../rust_wasm_module/pkg/rust_wasm_module";

// export class MyClass {
//     _number: number;
//     constructor() {
//         this._number = 42;
//     }

//     get number() {
//         return this._number;
//     }

//     set number(n) {
//         this._number = n;
//     }

//     render() {
//         return `My number is: ${this.number}`;
//     }
// }

// setup();

// function jsCallback() {
//     return new Promise((resolve, reject) => {
//         // some asynchronous operation
//         setTimeout(() => {
//             console.log("Resolved");
//             resolve("Data from JS callback");
//         }, 1000);
//     });
// }

function consumeData() {
    // global.jsCallback = jsCallback;

    // const data = await get_next_data(new MyClass());
    // if (data) {
    //     console.log({ data });
    //     // Process the data and apply backpressure if necessary.
    //     // if (someConditionForBackpressure()) {
    //     //     setTimeout(consumeData, 1000); // Wait for 1 second before consuming the next data
    //     // } else {
    //     //     consumeData();
    //     // }

    //     await consumeData();
    // } else {
    //     console.log("No more data or an error occurred");
    // }

    function Third() {
        return <p>Third!</p>;
    }

    const el = new JSXElement3(
        (
            <div>
                <p data-one>Hello</p>
                <p data-two>World</p>
                <Third />
                <p data-four>Fourt</p>
            </div>
        )
    );

    const t = el.get_type();
    console.log(t.to_html());

    // const fn = () => "yes";
    // const res = await processJSX(new JSXElement3(<p>Hello</p>));

    // console.log({ res });
}

void consumeData();
