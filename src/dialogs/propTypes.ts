import PropTypes from 'prop-types';

type DialogStylePropType = {
  base: $TSFixMe;
  transitions?: {
    up: $TSFixMe;
  };
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'Requireable<InferProps<{ base: Validator<obj... Remove this comment to see the full error message
const DialogStylePropType: PropTypes.Requireable<DialogStylePropType> = PropTypes.shape({
  base: PropTypes.object.isRequired,
  transitions: PropTypes.shape({
    up: PropTypes.object.isRequired
  })
});
export { DialogStylePropType };
