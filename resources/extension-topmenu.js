((window) => {
  const shouldDisplay = () => {
    return true;
  };

  const flyout = (context) => {
    const app = context?.application;
    return React.createElement(
      "div",
      { style: { padding: "10px" } },
      app
        ? `Application Name: ${JSON.stringify(app)}`
        : "No application selected"
    );
  };

  const component = (context) => {
    return React.createElement(
      "div",
      {
        onClick: () => {
          context.showFlyout({
            title: "App Info",
            content: flyout(context),
          });
        },
        style: {
          cursor: "pointer",
          padding: "6px 12px",
          color: "#fff",
        },
      },
      "Show App Info"
    );
  };

  window.extensionsAPI.registerTopBarActionMenuExt(
    component,
    "App Info",
    "App_Info_TopBar",
    flyout,
    shouldDisplay,
    "",
    true
  );
})(window);
