import ImageWidget from 'nucleus-widgets/lib/Image/ImageWidget';
import { connect } from 'react-redux';

export function mapStateToProps(): $TSFixMe {
  return {
    enableHyperlink: true
  };
}

export default connect(mapStateToProps)(ImageWidget);
