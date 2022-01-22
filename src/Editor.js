import React from "react";
import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup"
import { placeholder } from "@codemirror/view"
import { json } from "@codemirror/lang-json"
import * as JSONbig from 'json-bigint'
import { debug, sortObjectByKeys, stringToBoolean } from "./utils"
import Cookies from 'universal-cookie';

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      format_on_paste: true,
      sort_keys: true,
      recursive_parsing: true,
    }

    this.handle_checkbox_toggle_of_format_on_paste = this.handle_checkbox_toggle_of_format_on_paste.bind(this);
    this.handle_checkbox_toggle_of_sort_keys = this.handle_checkbox_toggle_of_sort_keys.bind(this);
    this.handle_checkbox_toggle_of_recursive_parsing = this.handle_checkbox_toggle_of_recursive_parsing.bind(this);
    this.btn_format_on_click = this.btn_format_on_click.bind(this);
    this.format = this.format.bind(this);
  }

  componentDidMount() {
    this.setup_editor()
    this.init_options_from_cookies()
  }

  btn_format_on_click() {
    this.format()
  }

  handle_checkbox_toggle_of_format_on_paste() {
    this.setState({
      format_on_paste: !this.state.format_on_paste
    }, this.refresh_cookies)
  }
  handle_checkbox_toggle_of_sort_keys() {
    this.setState({
      sort_keys: !this.state.sort_keys
    }, this.refresh_cookies)
  }
  handle_checkbox_toggle_of_recursive_parsing() {
    this.setState({
      recursive_parsing: !this.state.recursive_parsing
    }, this.refresh_cookies)
  }

  /* cookies */
  init_options_from_cookies () {
    const cookies = new Cookies();
    debug(cookies.getAll())
    this.setState({
      format_on_paste: stringToBoolean(cookies.get("format_on_paste")),
      sort_keys: stringToBoolean(cookies.get("sort_keys")),
      recursive_parsing: stringToBoolean(cookies.get("recursive_parsing")), 
    })
  }
  refresh_cookies() {
    const cookies = new Cookies();
    cookies.set("format_on_paste", this.state.format_on_paste)
    cookies.set("sort_keys", this.state.sort_keys)
    cookies.set("recursive_parsing", this.state.recursive_parsing)
  }

  setup_editor() {
    const base_theme = EditorView.theme({
      "&": {
        maxHeight: "900px",
        backgroundColor: "",
        border: "0.1px solid #ddd"
      },
      "&.cm-editor": { fontSize: "14px", },
      ".cm-scroller": { overflow: "auto", },
      ".cm-content, .cm-gutter": { minHeight: "100px", fontFamily: "SF Mono" },
      "&.cm-editor.cm-focused": { outline: "none" },
      ".cm-line, .cm-gutterElement": { lineHeight: "normal" },
      ".cm-search": { left: "10px" },
      ".cm-search button[name=close]": { left: "-8px" }
    })

    const formatOnPasteExtension = EditorView.updateListener.of((update) => {
      if (!this.state.format_on_paste) { return }
      if (!update.docChanged || update.transactions.length === 0) { return }
      let tr0 = update.transactions[0];
      if (!tr0.isUserEvent("input.paste")) { return }

      this.format()
    })

    this.editor = new EditorView({
      state: EditorState.create({
        extensions: [
          basicSetup,
          json(),
          placeholder("paste or type json here..."),
          base_theme,
          formatOnPasteExtension,
        ],
      }),
      parent: document.getElementById("editor")
    })

    this.editor.focus()
  }

  format() {
    let doc = this.editor.viewState.state.doc
    let text = doc.sliceString(0, doc.length)
    debug('raw text:', text)
    try {
      let jsonObj = JSONbig.parse(text)
      debug('parsed object:', jsonObj)
      let formattedJsonText
      if (this.state.sort_keys) {
        formattedJsonText = JSONbig.stringify(sortObjectByKeys(jsonObj), null, 2)
      } else {
        formattedJsonText = JSONbig.stringify(jsonObj, null, 2)
      }
      debug('formatted text:', formattedJsonText)
      this.editor.dispatch({ changes: { from: 0, to: doc.length, insert: formattedJsonText } })
    } catch (error) {
      console.log("parsing failed:", error)
    }

    this.editor.focus()
  }


  render() {
    return (
      <div>
        <div className="toolbar">
          <span className="title">JSON Tools</span>
          <input
            type="button" value="Format" className="option"
            onClick={this.btn_format_on_click} />
          <span className="option">
            <label htmlFor="format_on_paste">Format on paste</label>
            <input
              type="checkbox"
              checked={this.state.format_on_paste}
              onChange={this.handle_checkbox_toggle_of_format_on_paste}
            />
          </span>
          <span className="option">
            <label htmlFor="sort_keys">Sort keys</label>
            <input
              type="checkbox"
              checked={this.state.sort_keys}
              onChange={this.handle_checkbox_toggle_of_sort_keys}
            />
          </span>
          <span className="option">
            <label htmlFor="recursive">Recursive</label>
            <input
              type="checkbox"
              checked={this.state.recursive_parsing}
              onChange={this.handle_checkbox_toggle_of_recursive_parsing}
            />
          </span>
        </div>
        <div id="editor"></div>
      </div>
    )
  }
}

export default Editor;