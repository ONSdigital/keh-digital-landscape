import * as Tooltip from '@radix-ui/react-tooltip';
import '../../../styles/App.css';

const TimelineTooltip = ({
  title,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 100,
}) => {
  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            className="radix-tooltip-content"
            side={side}
            align={align}
            sideOffset={6}
          >
            {title}
            <Tooltip.Arrow className="radix-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default TimelineTooltip;
