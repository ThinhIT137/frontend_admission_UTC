import { Node, mergeAttributes } from "@tiptap/core";
import Paragraph from "@tiptap/extension-paragraph";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    cmsCard: {
      insertCmsCard: () => ReturnType;
      addCardToCurrentGrid: () => ReturnType;
      deleteCurrentCard: () => ReturnType;
    };
    cmsGrid: {
      insertCmsGrid: (options?: { cols?: 2 | 3 }) => ReturnType;
      toggleGridColumns: () => ReturnType;
      insertParagraphAfterGrid: () => ReturnType;
    };
  }
}

/**
 * Custom Paragraph preserving classes like "cms-tile-source"
 */
export const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

/**
 * CmsCard Node: Represents an individual tile/card in UTC style.
 */
export const CmsCard = Node.create({
  name: "cmsCard",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [
      { tag: "div.cms-tile" },
      { tag: "article.cms-tile" },
      { tag: 'div[data-type="cms-card"]' },
      { tag: "article" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "cms-tile",
        "data-type": "cms-card",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertCmsCard:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Tiêu đề thẻ" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Nhập nội dung thẻ tại đây..." }],
                },
              ],
            })
            .run();
        },
      addCardToCurrentGrid:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          let cardDepth = -1;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "cmsCard") {
              cardDepth = d;
              break;
            }
          }

          if (cardDepth > 0) {
            if (dispatch) {
              const insertPos = $from.after(cardDepth);
              const cardNode = state.schema.nodes.cmsCard.create(null, [
                state.schema.nodes.heading.create(
                  { level: 3 },
                  state.schema.text("Tiêu đề thẻ mới")
                ),
                state.schema.nodes.paragraph.create(
                  null,
                  state.schema.text("Nội dung chi tiết thẻ...")
                ),
              ]);
              dispatch(state.tr.insert(insertPos, cardNode));
            }
            return true;
          }
          return false;
        },
      deleteCurrentCard:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "cmsCard") {
              if (dispatch) {
                const from = $from.before(d);
                const to = $from.after(d);
                const parent = $from.node(d - 1);
                if (parent && parent.type.name === "cmsGrid" && parent.childCount <= 1) {
                  const gridFrom = $from.before(d - 1);
                  const gridTo = $from.after(d - 1);
                  dispatch(state.tr.delete(gridFrom, gridTo));
                } else {
                  dispatch(state.tr.delete(from, to));
                }
              }
              return true;
            }
          }
          return false;
        },
    };
  },
});

/**
 * CmsGrid Node: Multi-column responsive grid container for CmsCards.
 */
export const CmsGrid = Node.create({
  name: "cmsGrid",
  group: "block",
  content: "cmsCard+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: (element) => {
          if (element.classList && element.classList.contains("cms-grid-3")) return 3;
          if (element.getAttribute("data-cols") === "3") return 3;
          return 2;
        },
        renderHTML: (attributes) => {
          const c = attributes.cols === 3 ? 3 : 2;
          return {
            "data-cols": c,
            class: c === 3 ? "cms-grid-3" : "cms-grid-2",
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: "div.cms-grid-2", attrs: { cols: 2 } },
      { tag: "div.cms-grid-3", attrs: { cols: 3 } },
      {
        tag: 'div[data-type="cms-grid"]',
        getAttrs: (el) => {
          const element = el as HTMLElement;
          const is3 =
            element.classList?.contains("cms-grid-3") ||
            element.getAttribute("data-cols") === "3";
          return { cols: is3 ? 3 : 2 };
        },
      },
      {
        tag: "div",
        getAttrs: (el) => {
          const element = el as HTMLElement;
          const className = element.className || "";
          if (className.includes("lg:grid-cols-3") || className.includes("grid-cols-3")) {
            return { cols: 3 };
          }
          if (className.includes("lg:grid-cols-2") || className.includes("grid-cols-2")) {
            return { cols: 2 };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const cols = HTMLAttributes["data-cols"] === 3 || HTMLAttributes.cols === 3 ? 3 : 2;
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: cols === 3 ? "cms-grid-3" : "cms-grid-2",
        "data-type": "cms-grid",
        "data-cols": cols,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertCmsGrid:
        (options = { cols: 2 }) =>
        ({ state, dispatch }) => {
          if (dispatch) {
            const cols = options.cols === 3 ? 3 : 2;
            const cards = Array.from({ length: cols }).map((_, i) =>
              state.schema.nodes.cmsCard.create(null, [
                state.schema.nodes.heading.create(
                  { level: 3 },
                  state.schema.text(`Thẻ thông tin ${i + 1}`)
                ),
                state.schema.nodes.paragraph.create(
                  null,
                  state.schema.text("Nhập nội dung thẻ tại đây...")
                ),
              ])
            );
            const gridNode = state.schema.nodes.cmsGrid.create({ cols }, cards);
            dispatch(state.tr.replaceSelectionWith(gridNode));
          }
          return true;
        },
      toggleGridColumns:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "cmsGrid") {
              if (dispatch) {
                const gridNode = $from.node(d);
                const currentCols = gridNode.attrs.cols || 2;
                const newCols = currentCols === 2 ? 3 : 2;
                const pos = $from.before(d);
                dispatch(
                  state.tr.setNodeMarkup(pos, undefined, {
                    ...gridNode.attrs,
                    cols: newCols,
                  })
                );
              }
              return true;
            }
          }
          return false;
        },
      insertParagraphAfterGrid:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "cmsGrid") {
              if (dispatch) {
                const pos = $from.after(d);
                const p = state.schema.nodes.paragraph.create(null);
                dispatch(state.tr.insert(pos, p));
              }
              return true;
            }
          }
          return false;
        },
    };
  },
});
