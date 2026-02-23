/**
 * Kair0s Unified Component Library
 * 
 * Single source of truth for all UI components with consistent
 * visual identity, interaction patterns, and state management.
 */

// ============================================================================
// BASE COMPONENTS
// ============================================================================

export { Button } from './Button.js';
export { Input } from './Input.js';
export { Card } from './Card.js';
export { Badge } from './Badge.js';
export { Modal } from './Modal.js';
export { Tooltip } from './Tooltip.js';
export { Loading } from './Loading.js';
export { Icon } from './Icon.js';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export { Container } from './layout/Container.js';
export { Grid } from './layout/Grid.js';
export { Flex } from './layout/Flex.js';
export { Stack } from './layout/Stack.js';
export { Sidebar } from './layout/Sidebar.js';
export { Header } from './layout/Header.js';
export { Footer } from './layout/Footer.js';

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export { Form } from './forms/Form.js';
export { Select } from './forms/Select.js';
export { Checkbox } from './forms/Checkbox.js';
export { Radio } from './forms/Radio.js';
export { Switch } from './forms/Switch.js';
export { Slider } from './forms/Slider.js';
export { DatePicker } from './forms/DatePicker.js';

// ============================================================================
// FEEDBACK COMPONENTS
// ============================================================================

export { Alert } from './feedback/Alert.js';
export { Toast } from './feedback/Toast.js';
export { Progress } from './feedback/Progress.js';
export { Spinner } from './feedback/Spinner.js';
export { EmptyState } from './feedback/EmptyState.js';
export { ErrorBoundary } from './feedback/ErrorBoundary.js';

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

export { Tabs } from './navigation/Tabs.js';
export { Breadcrumb } from './navigation/Breadcrumb.js';
export { Pagination } from './navigation/Pagination.js';
export { Menu } from './navigation/Menu.js';
export { Dropdown } from './navigation/Dropdown.js';

// ============================================================================
// DATA DISPLAY COMPONENTS
// ============================================================================

export { Table } from './data/Table.js';
export { List } from './data/List.js';
export { Avatar } from './data/Avatar.js';
export { Chip } from './data/Chip.js';
export { Divider } from './data/Divider.js';
export { Timeline } from './data/Timeline.js';

// ============================================================================
// BUSINESS COMPONENTS
// ============================================================================

export { PresetSelector } from './business/PresetSelector.js';
export { ObjectiveCreator } from './business/ObjectiveCreator.js';
export { SessionStatus } from './business/SessionStatus.js';
export { ArtifactViewer } from './business/ArtifactViewer.js';
export { KPIDashboard } from './business/KPIDashboard.js';

// ============================================================================
// EXPORT ALL COMPONENTS WITH TYPES
// ============================================================================

export * from './types.js';

// Component registry for dynamic loading
export const componentRegistry = {
  Button,
  Input,
  Card,
  Badge,
  Modal,
  Tooltip,
  Loading,
  Icon,
  Container,
  Grid,
  Flex,
  Stack,
  Sidebar,
  Header,
  Footer,
  Form,
  Select,
  Checkbox,
  Radio,
  Switch,
  Slider,
  DatePicker,
  Alert,
  Toast,
  Progress,
  Spinner,
  EmptyState,
  ErrorBoundary,
  Tabs,
  Breadcrumb,
  Pagination,
  Menu,
  Dropdown,
  Table,
  List,
  Avatar,
  Chip,
  Divider,
  Timeline,
  PresetSelector,
  ObjectiveCreator,
  SessionStatus,
  ArtifactViewer,
  KPIDashboard,
};
