/** 详情 Drawer 顶部的城市切换菜单（卡片正常模式不出现菜单，保持无 chrome）。 */

import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowClockwise16Regular,
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
    justifyContent: 'flex-start',
    paddingLeft: tokens.spacingHorizontalXXS,
    paddingRight: tokens.spacingHorizontalXS,
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  cityName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  located: {
    color: tokens.colorBrandForeground1,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  menuItemText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '220px',
  },
});

export function CityMenu({
  settings,
  locatedPlace,
  className,
  triggerClassName,
  onSelectPlace,
  onManageCities,
  onOpenSettings,
  onRefresh,
}) {
  const styles = useStyles();
  const places = settings?.places || [];
  const locatedMissing = locatedPlace && !places.some((place) => place.id === locatedPlace.id);

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          size="large"
          className={mergeClasses(styles.trigger, triggerClassName)}
          icon={<Location16Regular />}
          title="切换城市"
          aria-label="切换城市"
        >
          <span className={mergeClasses(styles.cityName, className)}>
            {places.find((place) => place.isCurrent)?.name || '选择城市'}
          </span>
          <ChevronDown16Regular />
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {places.map((place) => (
            <MenuItem
              key={place.id}
              icon={place.isCurrent ? <Checkmark16Filled /> : <Location16Regular />}
              onClick={() => onSelectPlace(place.id)}
            >
              <span className={styles.menuItemText}>{placeMenuLabel(place)}</span>
            </MenuItem>
          ))}
          {locatedMissing && (
            <MenuItem icon={<Location16Regular />} onClick={() => onSelectPlace(locatedPlace.id, { addIfMissing: true })}>
              <span className={styles.menuItemText}>当前位置 · {locatedPlace.name}</span>
              <span className={styles.located}>定位</span>
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem icon={<ArrowClockwise16Regular />} onClick={onRefresh}>
            刷新数据
          </MenuItem>
          <MenuItem icon={<Settings16Regular />} onClick={onManageCities}>
            管理城市…
          </MenuItem>
          <MenuItem icon={<Settings16Regular />} onClick={onOpenSettings}>
            天气设置…
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
