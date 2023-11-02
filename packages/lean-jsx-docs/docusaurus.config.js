// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "lean-jsx",
    tagline: "You don't need a framework for your web app",
    favicon: "img/icon.svg",

    // Set the production url of your site here
    url: "https://your-docusaurus-test-site.com",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/lean-jsx/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "lean-web", // Usually your GitHub org/user name.
    projectName: "lean-jsx", // Usually your repo name.
    deploymentBranch: "gh-pages",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"]
    },

    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve("./sidebars.js")
                    // editUrl:
                    //     "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/"
                },
                blog: {
                    showReadingTime: true
                    // editUrl:
                    //     "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/"
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css")
                }
            })
        ]
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // Replace with your project's social card
            image: "img/logo.svg",
            navbar: {
                title: "lean-jsx",
                logo: {
                    alt: "My Site Logo",
                    src: "img/logo.svg"
                },
                items: [
                    {
                        type: "docSidebar",
                        sidebarId: "tutorialSidebar",
                        position: "left",
                        label: "Docs"
                    },
                    { to: "/blog", label: "Blog", position: "left" },
                    {
                        to: "/docs/about",
                        label: "Mainteners",
                        position: "left"
                    },
                    {
                        href: "https://github.com/lean-web/lean-jsx",
                        label: "GitHub",
                        position: "right"
                    }
                ]
            },
            footer: {
                style: "dark",
                links: [
                    {
                        title: "Docs",
                        items: [
                            {
                                label: "Tutorial",
                                to: "/docs/intro"
                            }
                        ]
                    },
                    // {
                    //     title: "Community",
                    //     items: [
                    //         {
                    //             label: "Stack Overflow",
                    //             href:
                    //                 "https://stackoverflow.com/questions/tagged/docusaurus"
                    //         },
                    //         {
                    //             label: "Discord",
                    //             href: "https://discordapp.com/invite/docusaurus"
                    //         },
                    //         {
                    //             label: "Twitter",
                    //             href: "https://twitter.com/docusaurus"
                    //         }
                    //     ]
                    // },
                    {
                        title: "More",
                        items: [
                            {
                                label: "Blog",
                                to: "/blog"
                            },
                            {
                                label: "GitHub",
                                href: "https://github.com/lean-web/lean-jsx"
                            }
                        ]
                    }
                ],
                copyright: `Copyright © ${new Date().getFullYear()} LeanJSX. Documentation built with Docusaurus.`
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme
            },
            announcementBar: {
                id: "alpha",
                content:
                    'LeanJSX is currently on Alpha release. Please read <a href="/blog/alpha-is-out">our first blog post</a> before using it in production.',
                backgroundColor: "#b66d00",
                textColor: "#fff",
                isCloseable: false
            },
            colorMode: {
                defaultMode: "dark"
            }
        })
};

module.exports = config;
