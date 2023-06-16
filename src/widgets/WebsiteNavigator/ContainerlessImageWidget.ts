import { connect } from 'react-redux';
import ContainerlessImageWidget from 'nucleus-widgets/lib/Image/ContainerlessImageWidget';
import { mapStateToProps } from '../ImageWidget';

/**
 * Modified data wrapper for the containerless image widget.
 */
export default connect(mapStateToProps)(ContainerlessImageWidget);
