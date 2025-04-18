((window) => {
  const shouldDisplay = () => true;

  const flyout = (context) => {
    const app = context?.application;
    const [inputValue, setInputValue] = React.useState('');
    const [statusMessage, setStatusMessage] = React.useState('');

    const submitAnnotation = async () => {
      if (!inputValue || !app) return;
    
      const patch = [
        {
          Namespace: app.metadata.name,
          ResourceName : app.metadata.namespace,
          // Kind: application.kind,
          Project: app.Project,
          PatchType:"application/json-patch+json",
          Patch: "{\"metadata\":{\n  \"annotations\":{\n    \"my-annotation\":"+inputValue+"\n  }\n}}"
          // path: '/metadata/annotations/my.annotation',
          // value: inputValue,
        },
      ];
    
      try {
        const res = await fetch(
          `/api/v1/applications/${app.metadata.name}?proj=${app.spec.project}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(patch),
          }
        );
    
        const responseText = await res.text(); // Read the response body
    
        if (res.ok) {
          setStatusMessage('✅ Annotation added!');
        } else {
          setStatusMessage(`❌ Failed to add annotation:\n${responseText}`);
        }
      } catch (err) {
        setStatusMessage(`❌ Error occurred: ${err.message}`);
      }
    };
    

    return React.createElement('div', {
      style: {
        padding: '15px',
        backgroundColor: '#fff8dc',
        border: '4px dashed #ff69b4',
        borderRadius: '15px',
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
        boxShadow: '4px 4px 0px #00000055',
      },
      children: [
        React.createElement('div', { style: { marginBottom: '10px' } }, 'Enter annotation value:'),
        React.createElement('div', { style: { marginBottom: '10px' } }, 'Enter annotation value:'),
        React.createElement('input', {
          type: 'text',
          value: inputValue,
          onChange: (e) => setInputValue(e.target.value),
          style: {
            padding: '5px',
            width: '100%',
            marginBottom: '10px',
            borderRadius: '10px',
            border: '2px solid #ff69b4',
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
          },
        }),
        React.createElement(
          'button',
          {
            onClick: submitAnnotation,
            style: {
              padding: '8px 16px',
              backgroundColor: '#ffcc00',
              border: '3px solid #ff69b4',
              borderRadius: '15px',
              fontWeight: 'bold',
              fontFamily: "'Comic Sans MS', cursive, sans-serif",
              cursor: 'pointer',
            },
          },
          '💾 Submit'
        ),
        statusMessage &&
          React.createElement(
            'div',
            { style: { marginTop: '10px', color: '#333' } },
            statusMessage
          ),
      ],
    });
  };

  const component = (context) => {
    return React.createElement(
      'div',
      {
        onClick: () =>
          context.showFlyout({
            title: '🎈 Add Annotation',
            content: React.createElement(flyout, { ...context }),
          }),
        style: {
          cursor: 'pointer',
          padding: '10px 20px',
          backgroundColor: '#ffcc00',
          border: '3px solid #ff69b4',
          borderRadius: '20px',
          color: '#000',
          fontWeight: 'bold',
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          boxShadow: '3px 3px 0px #ff69b4',
          transition: 'all 0.2s',
        },
        onMouseEnter: (e) => {
          e.target.style.transform = 'scale(1.1)';
        },
        onMouseLeave: (e) => {
          e.target.style.transform = 'scale(1)';
        },
      },
      '📝 Annotate App'
    );
  };

  window.extensionsAPI.registerTopBarActionMenuExt(
    component,
    'Add Annotation',
    'Annotate_App_TopBar',
    flyout,
    shouldDisplay,
    '',
    true
  );
})(window);
