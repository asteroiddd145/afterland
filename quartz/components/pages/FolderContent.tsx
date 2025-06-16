  import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

  import style from "../styles/listPage.scss"
  import { PageList, SortFn } from "../PageList"
  import { Root } from "hast"
  import { htmlToJsx } from "../../util/jsx"
  import { i18n } from "../../i18n"
  import { QuartzPluginData } from "../../plugins/vfile"
  import { ComponentChildren } from "preact"
  import { concatenateResources } from "../../util/resources"
  import { trieFromAllFiles } from "../../util/ctx"

  interface FolderContentOptions {
    /**
     * Whether to display number of folders
     */
    showFolderCount: boolean
    showSubfolders: boolean
    sort?: SortFn
  }

  const defaultOptions: FolderContentOptions = {
    showFolderCount: true,
    showSubfolders: true,
  }

  export default ((opts?: Partial<FolderContentOptions>) => {
    const options: FolderContentOptions = { ...defaultOptions, ...opts }

    const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
      const { tree, fileData, allFiles, cfg } = props

      const trie = (props.ctx.trie ??= trieFromAllFiles(allFiles))
      const folder = trie.findNode(fileData.slug!.split("/"))
      if (!folder) {
        return null
      }

      const allPagesInFolder: QuartzPluginData[] =
        folder.children
          .map((node) => {
            if (node.isFolder && options.showSubfolders) {
              const orderFile = node.children.find(child => child.slugSegment === "order")
              const folderOrder = orderFile?.data?.frontmatter?.order
              const getMostRecentDates = (): QuartzPluginData["dates"] => {
                let maybeDates: QuartzPluginData["dates"] | undefined = undefined
                for (const child of node.children) {
                  if (child.data?.dates) {
                    if (!maybeDates) {
                      maybeDates = { ...child.data.dates }
                    } else {
                      if (child.data.dates.created > maybeDates.created) {
                        maybeDates.created = child.data.dates.created
                      }
                      if (child.data.dates.modified > maybeDates.modified) {
                        maybeDates.modified = child.data.dates.modified
                      }
                      if (child.data.dates.published > maybeDates.published) {
                        maybeDates.published = child.data.dates.published
                      }
                    }
                  }
                }
                return (
                  maybeDates ?? {
                    created: new Date(),
                    modified: new Date(),
                    published: new Date(),
                  }
                )
              }

              return {
                slug: node.slug,
                isFolder: true,
                dates: getMostRecentDates(),
                frontmatter: {
                  title: node.displayName,
                  tags: [],
                  order: folderOrder !== undefined ? Number(folderOrder) : Number.MAX_VALUE,
                },
              }
            }

            if (node.data && node.slugSegment !== "order") {
              return {
                ...node.data,
                isFolder: false,
                frontmatter: {
                  ...node.data.frontmatter,
                  title: node.data.frontmatter?.title ?? "Untitled",
                  order:
                    node.data.frontmatter?.order !== undefined
                      ? Number(node.data.frontmatter.order)
                      : Number.MAX_VALUE,
                },
              }
            }

            return undefined
          })
          .filter((page) => page !== undefined)

      function sortPages(a: QuartzPluginData, b: QuartzPluginData): number {
        const aIsFolder = !!a.isFolder
        const bIsFolder = !!b.isFolder

        if (aIsFolder && !bIsFolder) return -1
        if (!aIsFolder && bIsFolder) return 1

        const aOrder = Number(a.frontmatter?.order) || Number.MAX_VALUE
        const bOrder = Number(b.frontmatter?.order) || Number.MAX_VALUE
        if (aOrder !== bOrder) return aOrder - bOrder
        
        const aTitle = a.frontmatter?.title ?? ""
        const bTitle = b.frontmatter?.title ?? ""
        return aTitle.localeCompare(bTitle)
      }
      const sortedPages = [...allPagesInFolder].sort(sortPages);

      const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
      const classes = cssClasses.join(" ")
      const listProps = {
        ...props,
        //sort: undefined,
        allFiles: sortedPages,
      }

      const content = (
        (tree as Root).children.length === 0
          ? fileData.description
          : htmlToJsx(fileData.filePath!, tree)
      ) as ComponentChildren

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <div class="page-listing">
            {options.showFolderCount && (
              <p>
                {i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
                  count: allPagesInFolder.length,
                })}
              </p>
            )}
            <div>
              <PageList {...listProps} />
            </div>
          </div>
        </div>
      )
    }

    FolderContent.css = concatenateResources(style, PageList.css)
    return FolderContent
  }) satisfies QuartzComponentConstructor
