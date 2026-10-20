/**
 * L1 header 的城市按钮 + 下拉菜单。
 *
 * 菜单只放城市切换、定位得到的「当前位置 · X」一键切换、以及「管理城市…」（进 L2）。
 * 定位成功即自动应用（D-16），所以这一行只在用户手动切到别的城市后出现。
 * 设置与刷新在 header 右侧，不重复进菜单；卡片上没有这个菜单（DENSITY chrome on demand）。
 */

import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  Checkmark16Filled,
  ChevronDown16Regular,
  Location16Regular,
  Settings16Regular,
} from '@fluentui/react-icons';
import { placeMenuLabel } from '../data/store.js';

const useStyles = makeStyles({
  trigger: {
    minWidth: 0,
    maxWidth: '100%',
    minHeight: '40px',
    justifyContent: 'flex-start',
    paddingInline: tokens.spacingHorizontalXS,
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground1,
  },
  cityName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  itemText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '260px',
  },
  itemHint: {
    color: tokens.colorNeutralForeground3,
    marginLeft: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
});

export function CityMenu({
  places,
  currentPlace,
  located,
  onSelectPlace,
  onAddPlace,
  onManageCities,
  className,
}) {
  const styles = useStyles();
  const list = Array.isArray(places) ? places : [];
  const locatedInList = Boolean(located && list.some((place) => place.id === located.id));
  const showLocated = Boolean(located && !located.isCurrent);

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          size="large"
          className={mergeClasses(styles.trigger, className)}
          aria-label={currentPlace ? `当前城市 ${currentPlace.name}，切换城市` : '选择城市'}
          title="切换城市"
        >
          <Text size={400} weight="semibold" className={styles.cityName}>
            {currentPlace?.name || '选择城市'}
          </Text>
          <ChevronDown16Regular />
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {list.map((place) => (
            <MenuItem
              key={place.id}
              icon={place.isCurrent ? <Checkmark16Filled /> : <Location16Regular />}
              onClick={() => onSelectPlace(place.id)}
            >
              <span className={styles.itemText}>{placeMenuLabel(place)}</span>
            </MenuItem>
          ))}
          {showLocated ? (
            <MenuItem
              icon={<Location16Regular />}
              onClick={() => (locatedInList ? onSelectPlace(located.id) : onAddPlace(located))}
            >
              <span className={styles.itemText}>当前位置 · {placeMenuLabel(located)}</span>
              <Text size={200} className={styles.itemHint}>
                {locatedInList ? '切换' : '添加'}
              </Text>
            </MenuItem>
          ) : null}
          <MenuDivider />
          <MenuItem icon={<Settings16Regular />} onClick={onManageCities}>
            管理城市…
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
