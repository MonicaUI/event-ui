import { connect } from 'react-redux';
import ContainerlessButtonWidget from 'nucleus-widgets/lib/Button/ContainerlessButtonWidget';
import { mapStateToProps, mapDispatchToProps } from '../RegisterButton/RegisterNowWidget';

/**
 * Modified data wrapper for the event register now widget.
 */
export default connect(mapStateToProps, mapDispatchToProps)(ContainerlessButtonWidget);
