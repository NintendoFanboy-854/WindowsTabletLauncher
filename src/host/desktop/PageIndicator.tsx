/**
 * 页面指示器（DESIGN.md §1.3）：
 * 7 页以内用圆点；超过 7 页折叠成“当前页/总页数”胶囊，避免排一长串点。
 */
import { mergeClasses } from '@fluentui/react-components';
import { pageIndicator } from '../layout';
import { useStyles } from './desktop.styles';

interface PageIndicatorProps {
  total: number;
  active: number;
}

export function PageIndicator({ total, active }: PageIndicatorProps) {
  const styles = useStyles();
  if (total <= 1) return null;
  const model = pageIndicator(total, active);

  return (
    <div
      className={styles.indicator}
      role="status"
      aria-label={`第 ${model.active + 1} 页，共 ${model.total} 页`}
      data-no-desktop-gesture="true"
    >
      {model.kind === 'dots'
        ? Array.from({ length: model.total }, (_, index) => (
            <span
              key={index}
              className={mergeClasses(
                styles.indicatorDot,
                index === model.active && styles.indicatorDotActive,
              )}
            />
          ))
        : (
            <span className={styles.indicatorCapsule}>
              {`${model.active + 1} / ${model.total}`}
            </span>
          )}
    </div>
  );
}
