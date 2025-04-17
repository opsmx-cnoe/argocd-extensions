((window) => {
  const shouldDisplay = () => {
    return true;
  };
  const flyout = () => {
    return React.createElement(
            "div",
            { style: { padding: "10px" } },
            "This is "+application.metadata?.['name']
    );
  };
  const component = () => {
    return React.createElement(
            "div",
            {
              onClick: () => flyout()
            },
            "Toolbar Extension Test"
    );
  };
  window.extensionsAPI.registerTopBarActionMenuExt(
          component,
          "Toolbar Extension Test",
          "Toolbar_Extension_Test",
          flyout,
          shouldDisplay,
          '',
          true
  );
})(window);
