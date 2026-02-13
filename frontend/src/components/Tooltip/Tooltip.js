import * as ReactTooltip from '@radix-ui/react-tooltip';
import '../../styles/App.css';

const Tooltip = ({
  title,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 100,
  arrowHeight = 3,
  arrowWidth = 8,
  ariaLabel = title,
}) => {
  return (
    <ReactTooltip.Provider delayDuration={delayDuration}>
      <ReactTooltip.Root>
        <ReactTooltip.Trigger asChild>{children}</ReactTooltip.Trigger>

        <ReactTooltip.Portal>
          <ReactTooltip.Content
            className="tooltip-content"
            side={side}
            align={align}
            sideOffset={6}
            aria-label={ariaLabel}
          >
            {title}
            <ReactTooltip.Arrow
              className="tooltip-arrow"
              height={arrowHeight}
              width={arrowWidth}
            />
          </ReactTooltip.Content>
        </ReactTooltip.Portal>
      </ReactTooltip.Root>
    </ReactTooltip.Provider>
  );
};

export default Tooltip;
