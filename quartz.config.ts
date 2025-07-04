import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "ПОСЛЕЗЕМЬЕ",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: { 
      provider: 'google', 
      tagId: 'G-JGYHSFTX7Q'
    },
    locale: "ru-RU",
    baseUrl: "afterland.ru",
    ignorePatterns: [
      "private", 
      "templates", 
      ".obsidian"
    ],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        title: "Noto Sans",
        header: "Noto Sans", //"Inter", //"Schibsted Grotesk",
        body: "Noto Sans", //"Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#FCF5E4", //"#faf8f8",
          lightgray: "#E4DCC8", //"#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#262626",
          dark: "#262626", //"#2b2b2b",
          secondary: "#6DB478", //"#f09670", //"#284b63",
          tertiary: "#52885A", //"#cb744e", //"#84a59d",
          highlight: "#8f9fa926",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#262626", //"#161618",
          lightgray: "#3A342E", //"#393639",
          gray: "#646464",
          darkgray: "#C5B8A1", //"#d4d4d4",
          dark: "#EFDFC3", //"#ebebec",
          secondary: "#6DB478", //"#f09670", //"#7b97aa",
          tertiary: "#52885A", //"#cb744e", //"#84a59d",
          highlight: "#8f9fa926",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [
      Plugin.RemoveDrafts(),
      Plugin.ExplicitPublish()
    ],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config