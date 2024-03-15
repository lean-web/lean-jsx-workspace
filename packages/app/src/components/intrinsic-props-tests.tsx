import { withClientContext } from "lean-web-utils/server";

export function CheckAllProps() {
    return (
        <div className="test-component" id="main-div" style={{ margin: "10" }}>
            <header className="app-header">
                <h1>Welcome to the JSX Sanity Test</h1>
            </header>

            <ACmp />

            <main>
                <button style={{ backgroundColor: "red", color: "white" }}>
                    With object styles
                </button>
                <button style="background-color: blue; color: white;">
                    With string styles
                </button>
                <form
                    method="GET"
                    onsubmit={withClientContext((ev) => {
                        ev.preventDefault();
                        console.log({ ev });
                        if (ev.target) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                            const name = ev.target["name"].value;
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            alert(`Submitted: ${name}`);
                        }
                    })}
                >
                    <input
                        name="name"
                        placeholder="Name"
                        autocapitalize="words"
                        autocomplete="name"
                    />
                    <button type="submit">Submit</button>
                </form>

                <section aria-label="Form section">
                    <form>
                        <label htmlFor="nameInput">Name:</label>
                        <input
                            type="text"
                            id="nameInput"
                            name="name"
                            defaultValue="John Doe"
                            onchange={(e) =>
                                console.log(
                                    e.target instanceof HTMLInputElement
                                        ? e.target.value
                                        : "",
                                )
                            }
                        />

                        <label htmlFor="ageRange">Age Range:</label>
                        <select id="ageRange" name="ageRange">
                            <option value="0-19">0-19</option>
                            <option value="20-29" selected={true}>
                                20-29
                            </option>
                            <option value="30-39">30-39</option>
                            <option value="40-49">40-49</option>
                            <option value="50+">50+</option>
                        </select>

                        <label>
                            <input
                                type="checkbox"
                                name="subscribe"
                                checked
                                onchange={() => {}}
                            />
                            Subscribe to newsletter
                        </label>

                        <button
                            type="submit"
                            disabled
                            onclick={(e) => e.preventDefault()}
                        >
                            Submit
                        </button>
                    </form>
                </section>

                <article data-article-id="123" hidden>
                    This article is hidden and contains a custom data attribute.
                </article>

                <div>
                    <input
                        aria-label="Name"
                        aria-required="true"
                        data-testid="name-input"
                        placeholder="Enter your name"
                    />
                    <div
                        style={{
                            marginTop: "15px",
                            color: "blue",
                            border: "1px solid black",
                        }}
                    >
                        Styled Div Element
                    </div>
                </div>

                <SVG />
                <StructuralExample />
                <InputExample />
                <MultimediaExample />
                <TableExample />
                <InteractiveExample />
                <EmbeddedContentExample />
            </main>
        </div>
    );
}

const SVG = () => (
    <>
        {" "}
        <svg width="100" height="100">
            <circle
                cx="50"
                cy="50"
                r="40"
                stroke="green"
                strokeWidth="4"
                fill="yellow"
            />
            <line
                x1="0"
                y1="3"
                x2="30"
                y2="3"
                strokeDasharray="4"
                stroke="green"
                strokeWidth="4"
            />
        </svg>
        <svg
            viewBox="-40 0 150 100"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
        >
            <g
                fill="grey"
                transform="rotate(-10 50 100)
translate(-36 45.5)
skewX(40)
scale(1 0.5)"
            >
                <path
                    id="heart"
                    d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"
                />
            </g>

            <use href="#heart" fill="none" stroke="red" />
        </svg>
    </>
);

const StructuralExample = () => (
    <section>
        <header>
            <h1>Page Title</h1>
            <nav>
                <ul>
                    <li>
                        <a href="#home">Home</a>
                    </li>
                    <li>
                        <a href="#about">About</a>
                    </li>
                </ul>
            </nav>
        </header>
        <article>
            <h2>Article Title</h2>
            <p>This is an example article.</p>
        </article>
        <footer>
            <small>&copy; 2024 Company</small>
        </footer>
    </section>
);

const InputExample = () => (
    <form>
        <label>
            Name:
            <input type="text" name="name" />
        </label>
        <label>
            Birthday:
            <input type="date" name="birthday" />
        </label>
        <label>
            Favorite Color:
            <input type="color" name="favoriteColor" />
        </label>
        <input type="submit" value="Submit" />
    </form>
);

const MultimediaExample = () => (
    <div>
        <img src="https://via.placeholder.com/150" alt="Placeholder" />
        <video width="320" height="240" controls>
            <source src="movie.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <audio controls>
            <source src="audio.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    </div>
);

const TableExample = () => (
    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Apples</td>
                <td>4</td>
                <td>$1.00</td>
            </tr>
            <tr>
                <td>Bananas</td>
                <td>2</td>
                <td>$1.50</td>
            </tr>
        </tbody>
    </table>
);

const InteractiveExample = () => (
    <details>
        <summary>More Information</summary>
        <p>This section contains more information.</p>
    </details>
);

const EmbeddedContentExample = () => (
    <iframe src="https://www.example.com" title="Example"></iframe>
);

function sleep() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, 2000);
    });
}

async function* ACmp() {
    yield <p>Loading</p>;
    await sleep();
    return <p>Hello world</p>;
}
