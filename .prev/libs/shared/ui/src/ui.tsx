import { exhaustive } from '@gamezilla/shared/core';
import {
  AccessTime,
  ArrowCircleRight,
  Check,
  ChevronRight,
  Close,
  ExitToApp,
  Extension,
  Flag,
  Lightbulb,
  People,
  RestartAlt,
  SmartToy,
  SwapHorizSharp,
  Tune,
} from '@mui/icons-material';
import * as MuiLab from '@mui/lab';
import * as Mui from '@mui/material';
import { TypographyProps, keyframes } from '@mui/material';
import { ReactNode, useEffect, useRef } from 'react';
import * as Icons from './ui-icons';
import { cn } from './utils';
import { MyButton } from './button';

//
//
//
// Theme
//
//
//

export const useTheme = () => {
  return Mui.useTheme();
};

export type ThemeMode = 'Light' | 'Dark' | 'System';

export const ThemeModeIcon = ({ themeMode }: { themeMode: ThemeMode }) => {
  switch (themeMode) {
    case 'Dark':
      return <Icons.DarkMode />;

    case 'Light':
      return <Icons.LightMode />;

    case 'System':
      return <Icons.SettingsBrightness />;
  }
};

const themeModes: { [key in ThemeMode]: ThemeMode } = {
  Light: 'Light',
  Dark: 'Dark',
  System: 'System',
};

const isThemeMode = (themeMode: unknown): themeMode is ThemeMode => {
  return typeof themeMode === 'string' && themeMode in themeModes;
};

export const ThemeModeToggleButtons = ({
  themeMode,
  onChange,
}: {
  themeMode: ThemeMode;
  onChange: (themeMode: ThemeMode) => void;
}) => {
  return (
    <Mui.ToggleButtonGroup
      fullWidth
      value={themeMode}
      exclusive
      orientation="vertical"
      onChange={(_event, value) => {
        if (isThemeMode(value)) {
          onChange(value);
        }
      }}
    >
      {Object.values(themeModes).map((themeMode) => (
        <Mui.ToggleButton key={themeMode} value={themeMode}>
          <Mui.Box
            sx={{
              marginRight: 1,
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <ThemeModeIcon themeMode={themeMode} />
          </Mui.Box>
          {themeMode}
        </Mui.ToggleButton>
      ))}
    </Mui.ToggleButtonGroup>
  );
};

//
//
//
// Components
//
//
//

export const TextField = ({ label, sx, ...props }: Mui.TextFieldProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (props.autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [props.autoFocus]);

  return (
    <Box sx={{ color: 'text.secondary', ...sx }}>
      <Typography
        color={props.disabled ? 'text.disabled' : 'inherit'}
        sx={{ mb: 1 / 2 }}
      >
        {label}
      </Typography>
      <Mui.TextField ref={ref} {...props} />
    </Box>
  );
};

export const InputBase = Mui.InputBase;

export const Snackbar = Mui.Snackbar;

export const Portal = Mui.Portal;

export const Grow = Mui.Grow;
export const Zoom = Mui.Zoom;
export const Fade = Mui.Fade;

export const SvgIcon = Mui.SvgIcon;

export const Box = Mui.Box;

export const box = (
  { key, sx }: Sx & { key?: string; sx?: Sx },
  children: ViewNode[]
) => {
  return (
    <Box key={key} sx={sx}>
      {children}
    </Box>
  );
};

export const Divider = Mui.Divider;

export const ListItemButton = Mui.ListItemButton;

export const LinearProgress = Mui.LinearProgress;

export const Chip = Mui.Chip;

export const ListItemText = Mui.ListItemText;

export const ListItemIcon = Mui.ListItemIcon;

export const Backdrop = Mui.Backdrop;

export const Checkbox = Mui.Checkbox;

export const ListItemSecondaryAction = Mui.ListItemSecondaryAction;

export const Paper = Mui.Paper;

export const Slider = Mui.Slider;

export const paper = (
  { key, ...sx }: Sx & { key?: string },
  children: ViewNode[]
) => {
  return (
    <Paper key={key} sx={sx} variant="outlined">
      {children}
    </Paper>
  );
};

export const Button = MuiLab.LoadingButton;

export const button = (
  {
    size,
    variant,
    onPress,
    startIcon,
    ...sx
  }: Sx & {
    startIcon: IconName;
    onPress?: () => void;
    variant: 'outlined' | 'contained' | 'text';
    size?: 'lg' | 'md' | 'sm';
  },
  text: string
) => {
  return (
    <Button
      variant={variant}
      onClick={onPress}
      sx={sx}
      size={
        size === 'lg'
          ? 'large'
          : size === 'md'
          ? 'medium'
          : size === 'sm'
          ? 'small'
          : undefined
      }
      startIcon={icon(startIcon)}
    >
      {text}
    </Button>
  );
};

export const InputAdornment = Mui.InputAdornment;

export const Typography = Mui.Typography;

export const text = (props: TypographyProps, children: ViewNode) => {
  return <Typography {...props}>{children}</Typography>;
};

export const Tabs = Mui.Tabs;

export const Tab = Mui.Tab;

export const Drawer = Mui.Drawer;

export const Card = Mui.Card;

export const CardActionArea = Mui.CardActionArea;

export const Dialog = Mui.Dialog;

export const DialogTitle = Mui.DialogTitle;

export const DialogActions = Mui.DialogActions;

export const DialogContent = Mui.DialogContent;

export const Alert = Mui.Alert;

export const AlertTitle = Mui.AlertTitle;

export const CircularProgress = Mui.CircularProgress;

export const spinner = ({ size, ...sx }: Sx & { size?: number }) => {
  return <CircularProgress size={size} sx={sx} />;
};

export const Collapse = Mui.Collapse;

export const Badge = Mui.Badge;

export const ListItemAvatar = Mui.ListItemAvatar;

export const ListItem = Mui.ListItem;

export const ListSubheader = Mui.ListSubheader;

export const MobileStepper = Mui.MobileStepper;

export const Avatar = Mui.Avatar;

export const avatar = ({ src, ...sx }: { src?: string | null } & Sx) => {
  return <Mui.Avatar src={src ?? ''} sx={sx} />;
};

export const AvatarGroup = Mui.AvatarGroup;

export const Menu = Mui.Menu;

export const MenuItem = Mui.MenuItem;

export const Select = Mui.Select;

export const List = Mui.List;

export const ButtonBase = Mui.ButtonBase;

export const Toolbar = Mui.Toolbar;

export const ToggleButtonGroup = Mui.ToggleButtonGroup;

export const Tooltip = Mui.Tooltip;

export const ToggleButton = Mui.ToggleButton;

export const Field = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <ListItemButton onClick={onClick}>
    <ListItemText
      primaryTypographyProps={{
        variant: 'subtitle1',
        color: 'text.secondary',
      }}
      primary={label}
      secondaryTypographyProps={{ variant: 'h6', color: 'text.primary' }}
      secondary={value}
    />
    <ListItemSecondaryAction>
      <Icons.ChevronRight />
    </ListItemSecondaryAction>
  </ListItemButton>
);

export const fillBox = ({ sx }: { sx?: Sx }, children: ViewNode[]) => {
  return box(
    {
      sx: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'scroll',
        padding: 0,
        margin: 0,
        ...sx,
      },
    },
    children
  );
};

export const FillBox = ({ sx, ...props }: Mui.BoxProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'hidden',
        padding: 0,
        margin: 0,
        ...sx,
      }}
      {...props}
    />
  );
};

export const LoadingPage = ({ title }: { title?: string }) => {
  return (
    <FillBox sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress sx={{ marginBottom: 2 }} />
      <Typography align="center" variant="caption" color="text.secondary">
        {title}
      </Typography>
    </FillBox>
  );
};

export const AspectRatio = ({
  aspectRatio,
  children,
}: {
  aspectRatio: number;
  children: ReactNode;
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        paddingTop: `${aspectRatio * 100}%`,
        position: 'relative',
        height: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export const LoadingBackdrop = ({ open }: { open?: boolean }) => {
  return (
    <Mui.Backdrop sx={{ zIndex: 10 }} open={Boolean(open)}>
      <CircularProgress />
    </Mui.Backdrop>
  );
};

export const LoadingDialog = ({
  open,
  title,
}: {
  open: boolean;
  title: string;
}) => {
  return (
    <Dialog open={open}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <CircularProgress sx={{ marginRight: 2 }} />
        <Typography variant="h6">{title}</Typography>
      </Box>
    </Dialog>
  );
};

export const ConformationDialog = ({
  open,
  onCancel,
  onClose,
  onConfirm,
  title,
  confirmTitle,
  cancelTitle = 'Cancel',
}: {
  open: boolean;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  confirmTitle: string;
  cancelTitle?: string;
  headerIcon?: ViewNode;
}) => {
  return (
    <div
      className={cn(
        'absolute top-0 left-0 w-full h-full grid place-items-center',
        open ? 'block' : 'hidden'
      )}
      onClick={onClose}
    >
      <div className="bg-neutral-900 p-6 w-80 rounded-lg flex flex-col gap-6">
        <p className="text-xl font-semibold text-center">{title}</p>

        <div className="flex items-center gap-4 w-full">
          <MyButton variant="outlined" onClick={onCancel} className="flex-1">
            {cancelTitle}
          </MyButton>
          <MyButton
            variant="contained"
            color="danger"
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmTitle}
          </MyButton>
        </div>
      </div>
    </div>
  );
};

export const pulse = keyframes`
  0% {
    opacity: 100%;
  }
  50% {
    opacity: 50%;
  }
  100% {
    opacity: 100%;
  }
`;

export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const pulseAnimation = `${pulse} 0.5s infinite ease`;

export type ViewNode = ReactNode;

export type Sx = Mui.SxProps;

export const actionButton = ({
  label,
  iconName,
  onPress,
}: {
  label: string;
  iconName: IconName;
  onPress?: () => void;
  disabled?: boolean;
}) => {
  // const theme = useTheme()
  return (
    <ButtonBase
      onClick={onPress}
      sx={{
        paddingY: 1 / 2,
        paddingX: 2,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        // color: disabled
        //   ? theme.palette.action.disabled
        //   : theme.palette.action.active,
      }}
    >
      {icon(iconName)}
      <Typography variant="caption">{label}</Typography>
    </ButtonBase>
  );
};

export const ActionButton = ({
  label,
  icon,
  onClick,
  disabled = false,
  color,
}: {
  sx?: Sx;
  color?: 'error' | 'success';
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      key={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-1 flex flex-col p-1 gap-0.5 text-sm items-center active:opacity-50',
        disabled && 'opacity-50',
        color === 'error' && 'text-red-500',
        color === 'success' && 'text-green-500'
      )}
    >
      {icon}
      <p className="text-xs">{label}</p>
    </button>
  );
};

//
//
//
//
//
//

export type IconName =
  | 'smart-toy'
  | 'exit'
  | 'swap'
  | 'restart'
  | 'flag'
  | 'puzzle'
  | 'tune'
  | 'chevron-right'
  | 'friends'
  | 'check'
  | 'lightbulb'
  | 'clock'
  | 'close'
  | 'people'
  | 'arrow-circle-right';

export const Icon = ({
  name,
  sx,
  className,
}: {
  className?: string;
  name: IconName;
  sx?: Sx;
}) => {
  switch (name) {
    case 'people': {
      return <People sx={sx} className={className} />;
    }
    case 'clock': {
      return <AccessTime sx={sx} className={className} />;
    }
    case 'close': {
      return <Close sx={sx} className={className} />;
    }

    case 'check': {
      return <Check sx={sx} className={className} />;
    }

    case 'lightbulb': {
      return <Lightbulb sx={sx} className={className} />;
    }

    case 'smart-toy': {
      return <SmartToy key="smart-toy" sx={sx} className={className} />;
    }

    case 'exit': {
      return (
        <ExitToApp
          sx={{ ...sx, transform: 'rotate(180deg)' }}
          className={className}
        />
      );
    }

    case 'tune': {
      return <Tune sx={{ ...sx }} className={className} />;
    }

    case 'swap': {
      return <SwapHorizSharp sx={sx} className={className} />;
    }

    case 'restart': {
      return <RestartAlt sx={sx} className={className} />;
    }

    case 'flag': {
      return <Flag sx={sx} className={className} />;
    }

    case 'puzzle': {
      return <Extension sx={sx} className={className} />;
    }

    case 'friends': {
      return <People sx={sx} className={className} />;
    }

    case 'chevron-right': {
      return <ChevronRight sx={sx} className={className} />;
    }

    case 'arrow-circle-right': {
      return <ArrowCircleRight sx={sx} className={className} />;
    }

    default: {
      return exhaustive(name);
    }
  }
};

export const icon = (name: IconName, sx?: Sx) => {
  switch (name) {
    case 'smart-toy': {
      return <SmartToy key="smart-toy" sx={sx} />;
    }

    case 'exit': {
      return <ExitToApp sx={{ ...sx, transform: 'rotate(180deg)' }} />;
    }
    case 'swap': {
      return <SwapHorizSharp sx={sx} />;
    }

    case 'restart': {
      return <RestartAlt sx={sx} />;
    }

    case 'flag': {
      return <Flag sx={sx} />;
    }

    default: {
      return <Flag sx={sx} />;
    }
  }
};
export const fragment = (children: ViewNode[]) => {
  return children;
};

export const conformation = ({
  iconName,
  open,
  title,
  subtitle,
  confirmTitle,
  cancelTitle = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
}: {
  iconName?: IconName;
  open: boolean;
  title: string;
  subtitle?: string;
  confirmTitle: string;
  cancelTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      {iconName &&
        icon(iconName, {
          margin: 'auto',
          paddingTop: 2,
          width: 64,
          height: 64,
        })}
      <DialogTitle>{title}</DialogTitle>
      {subtitle && (
        <DialogTitle variant="subtitle2" color="text.secondary">
          {subtitle}
        </DialogTitle>
      )}
      <DialogActions>
        <Button onClick={onCancel}>{cancelTitle}</Button>
        <Button onClick={onConfirm}>{confirmTitle}</Button>
      </DialogActions>
    </Dialog>
  );
};

export const ViewEmptyState = ({
  renderIcon,
  title,
}: {
  title: string;
  renderIcon: (props: { sx: Sx }) => ViewNode;
}) => {
  return (
    <FillBox
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'text.secondary',
      }}
    >
      {renderIcon({ sx: { width: 64, height: 64 } })}
      <Typography variant="h6">{title}</Typography>
    </FillBox>
  );
};

export const ViewLoadingState = ({ title }: { title: string }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <CircularProgress sx={{ mb: 1 }} />
      <Typography color="text.secondary">{title}</Typography>
    </Box>
  );
};
