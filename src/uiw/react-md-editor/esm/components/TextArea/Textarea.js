import _extends from "@babel/runtime/helpers/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";
import React, { useContext, useEffect } from 'react';
import { EditorContext } from '../../Context';
import { TextAreaCommandOrchestrator } from '../../commands';
import handleKeyDown from './handleKeyDown';
import shortcuts from './shortcuts';
import "./index.css";
import { jsx as _jsx } from "react/jsx-runtime";

var _excluded = ["prefixCls", "onChange"],
  _excluded2 = ["markdown", "commands", "fullscreen", "preview", "highlightEnable", "extraCommands", "tabSize", "defaultTabEnable", "dispatch"];
export default function Textarea(props) {
  var {
    prefixCls,
    onChange: _onChange
  } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  var _useContext = useContext(EditorContext),
    {
      markdown,
      commands,
      fullscreen,
      preview,
      highlightEnable,
      extraCommands,
      tabSize,
      defaultTabEnable,
      dispatch
    } = _useContext,
    otherStore = _objectWithoutPropertiesLoose(_useContext, _excluded2);
  var textRef = React.useRef(null);
  var executeRef = React.useRef();
  var statesRef = React.useRef({
    fullscreen,
    preview
  });
  useEffect(() => {
    statesRef.current = {
      fullscreen,
      preview,
      highlightEnable
    };
  }, [fullscreen, preview, highlightEnable]);
  useEffect(() => {
    if (textRef.current && dispatch) {
      var commandOrchestrator = new TextAreaCommandOrchestrator(textRef.current);
      executeRef.current = commandOrchestrator;
      dispatch({
        textarea: textRef.current,
        commandOrchestrator
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  var onKeyDown = e => {
    handleKeyDown(e, tabSize, defaultTabEnable);
    shortcuts(e, [...(commands || []), ...(extraCommands || [])], executeRef.current, dispatch, statesRef.current);
  };
  useEffect(() => {
    if (textRef.current) {
      textRef.current.addEventListener('keydown', onKeyDown);
    }
    return () => {
      if (textRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        textRef.current.removeEventListener('keydown', onKeyDown);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return /*#__PURE__*/_jsx("textarea", _extends({
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false
  }, other, {
    ref: textRef,
    className: prefixCls + "-text-input " + (other.className ? other.className : ''),
    value: markdown,
    onChange: e => {
      dispatch && dispatch({
        markdown: e.target.value
      });
      _onChange && _onChange(e);
    }
  }));
}