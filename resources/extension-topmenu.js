((window) => {
  const shouldDisplay = () => {
    return true;
  };

  const flyout = (context) => {
    const app = context?.application;
    return React.createElement(
      "div",
      { style: { 
        padding: "15px",
        backgroundColor: "#fff8dc",
        border: "4px dashed #ff69b4",
        borderRadius: "15px",
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
        boxShadow: "4px 4px 0px #00000055",
      } },
      app
        ? `Context Object: \n\n ${JSON.stringify(context)}`
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
          padding: "10px 20px",
          backgroundColor: "#ffcc00",
          border: "3px solid #ff69b4",
          borderRadius: "20px",
          color: "#000",
          fontWeight: "bold",
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          boxShadow: "3px 3px 0px #ff69b4",
          transition: "all 0.2s",
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
