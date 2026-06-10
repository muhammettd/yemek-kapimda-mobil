import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/src/constants/config';

interface FieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  multiline,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            multiline={multiline}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
          />
          {error ? <Text style={styles.error}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
});
