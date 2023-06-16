import React from 'react';

/**
 * Default dialog styles context is an empty object. Each application should define the DialogStylesContext.Provider
 * at the top level of their apps (higher in the tree than any framework components) so that we can connect to
 * the data via the DialogStylesContext.Consumer.
 */
const DialogStylesContext = React.createContext({});
export default DialogStylesContext;
