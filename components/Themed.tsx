import { Text as DefaultText, View as DefaultView } from 'react-native';
import { useColorScheme } from 'nativewind';

export type TextProps = DefaultText['props'];
export type ViewProps = DefaultView['props'];

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  const { colorScheme } = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
} 