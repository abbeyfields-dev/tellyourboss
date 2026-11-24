import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  AGE_GROUPS,
  COUNTRIES,
  EDUCATIONS,
  ETHNICITIES,
  GENDERS,
  INDUSTRIES,
  type InsightDraft,
} from '../data/profile';
import { theme, type } from '../theme';

type Props = {
  draft: InsightDraft;
  onChange: (draft: InsightDraft) => void;
  email?: string | null;
  survey?: boolean;
  audience?: 'you' | 'them';
};

export function ProfileFields({ draft, onChange, email, survey = true, audience = 'you' }: Props): React.JSX.Element {
  const patch = (next: Partial<InsightDraft>) => onChange({ ...draft, ...next });

  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <Text style={styles.section}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder={audience === 'them' ? 'Their name' : 'Your name'}
          placeholderTextColor={theme.colors.textDim}
          autoCapitalize="words"
          value={draft.displayName}
          onChangeText={(displayName) => patch({ displayName })}
        />
        {email ? (
          <Field label="Email">
            <View style={styles.locked}>
              <Text style={styles.lockedText}>{email}</Text>
            </View>
          </Field>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Work</Text>
        <SelectField
          label="Industry"
          value={draft.industry}
          placeholder="Choose an industry"
          options={INDUSTRIES}
          onChange={(industry) => patch({ industry })}
        />
        {draft.industry === 'Other' ? (
          <TextInput
            style={styles.input}
            placeholder="Type the industry"
            placeholderTextColor={theme.colors.textDim}
            autoCapitalize="words"
            value={draft.industryOther}
            onChangeText={(industryOther) => patch({ industryOther })}
          />
        ) : null}
        {survey ? (
          <>
            <SelectField
              label="Country"
              value={draft.country}
              placeholder="Choose a country"
              options={COUNTRIES}
              onChange={(country) => patch({ country })}
            />
            {draft.country === 'Other' ? (
              <TextInput
                style={styles.input}
                placeholder="Type the country"
                placeholderTextColor={theme.colors.textDim}
                value={draft.countryOther}
                onChangeText={(countryOther) => patch({ countryOther })}
              />
            ) : null}
            <Field label="City or region">
              <TextInput
                style={styles.input}
                placeholder="Where you are based"
                placeholderTextColor={theme.colors.textDim}
                autoCapitalize="words"
                value={draft.location}
                onChangeText={(location) => patch({ location })}
              />
            </Field>
            <Field label="State">
              <TextInput
                style={styles.input}
                placeholder="State or province"
                placeholderTextColor={theme.colors.textDim}
                autoCapitalize="words"
                value={draft.state}
                onChangeText={(state) => patch({ state })}
              />
            </Field>
            <Field label="Postal code">
              <TextInput
                style={styles.input}
                placeholder="Postal code"
                placeholderTextColor={theme.colors.textDim}
                autoCapitalize="characters"
                autoCorrect={false}
                value={draft.postalCode}
                onChangeText={(postalCode) => patch({ postalCode })}
              />
            </Field>
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Optional details</Text>
        <Text style={styles.optional}>Optional. Used only for insights.</Text>
        {survey ? (
          <ChipField
            label="Age group"
            value={draft.ageGroup}
            options={AGE_GROUPS}
            onChange={(ageGroup) => patch({ ageGroup })}
          />
        ) : null}
        <ChipField
          label="Gender"
          value={draft.gender}
          options={GENDERS}
          onChange={(gender) => patch({ gender })}
        />
        {survey ? (
          <SelectField
            label="Education"
            value={EDUCATIONS.find((item) => item.id === draft.education)?.label ?? ''}
            placeholder="Choose a qualification"
            options={EDUCATIONS.map((item) => item.label)}
            onChange={(label) => {
              const match = EDUCATIONS.find((item) => item.label === label);
              patch({ education: match ? match.id : null });
            }}
          />
        ) : null}
        {survey ? (
          <SelectField
            label="Ethnicity"
            value={ETHNICITIES.find((item) => item.id === draft.ethnicity)?.label ?? ''}
            placeholder="Prefer not to say"
            options={ETHNICITIES.map((item) => item.label)}
            onChange={(label) => {
              const match = ETHNICITIES.find((item) => item.label === label);
              patch({ ethnicity: match ? match.id : null });
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ChipField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: readonly { id: T; label: string }[];
  onChange: (value: T | null) => void;
}): React.JSX.Element {
  return (
    <Field label={label}>
      <View style={styles.chips}>
        {options.map((item) => {
          const on = value === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(on ? null : item.id)}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: readonly string[];
  onChange: (value: string) => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={styles.select}
        accessibilityRole="button"
      >
        <Text style={value ? styles.selectValue : styles.selectPlaceholder}>{value || placeholder}</Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open ? (
        <ScrollView style={styles.menu} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {options.map((item) => {
            const on = value === item;
            return (
              <Pressable
                key={item}
                onPress={() => {
                  onChange(on ? '' : item);
                  setOpen(false);
                }}
                accessibilityRole="button"
                style={[styles.menuItem, on && styles.menuItemOn]}
              >
                <Text style={[styles.menuLabel, on && styles.menuLabelOn]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </Field>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 12,
  },
  section: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  optional: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -6,
  },
  field: {
    gap: 6,
  },
  label: {
    ...type.sans,
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
    color: theme.colors.ink,
  },
  locked: {
    borderRadius: 12,
    backgroundColor: theme.colors.brandSoft,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  lockedText: {
    ...type.sans,
    color: theme.colors.brand,
    fontSize: 15,
    fontWeight: '600',
  },
  select: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectValue: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 16,
    flex: 1,
  },
  selectPlaceholder: {
    ...type.sans,
    color: theme.colors.textDim,
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  menu: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },
  menuItemOn: {
    backgroundColor: theme.colors.brandSoft,
  },
  menuLabel: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 15,
  },
  menuLabelOn: {
    color: theme.colors.brand,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipOn: {
    backgroundColor: theme.colors.brand,
    borderColor: theme.colors.brand,
  },
  chipLabel: {
    ...type.sans,
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelOn: {
    color: '#FFFFFF',
  },
});
