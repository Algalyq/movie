import React, {useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext'

const InputHeader = (props: any) => {
  const {t} = useTranslation();
  const { theme,colors } = useTheme();
  const [searchText, setSearchText] = useState<string>('');
  const handleTextChange = (textInput: string) => {
    setSearchText(textInput);
    if (props.searchFunction) {
      props.searchFunction(textInput);
    }
  };
  
  const handleSearch = () => {
    if (searchText.trim().length > 0) {
      props.searchFunction(searchText);
    } else {
      console.warn("Search term is empty");
    }
  };
  const color_place_holder = theme == 'dark' ? COLORS.WhiteRGBA32 : COLORS.Black;
  const color_text_input = theme == 'dark' ? COLORS.White : COLORS.Black;
  return (
    <View style={[styles.inputBox, { borderColor: theme == 'dark' ? COLORS.WhiteRGBA15 : COLORS.BlackRGB10 }]}>
      <TextInput
        style={[styles.textInput, { color: color_text_input }]}
        onChangeText={handleTextChange}
        value={searchText}
        placeholder={t('search.searchPlaceholder')}
        placeholderTextColor={color_place_holder}
      />
      <TouchableOpacity
        style={styles.searchIcon}
        onPress={handleSearch}>
        <Ionicons
          name="search"
          color={COLORS.Orange}
          size={FONTSIZE.size_20}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    display: 'flex',
    paddingVertical: SPACING.space_8,
    paddingHorizontal: SPACING.space_24,
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA15,
    borderRadius: BORDERRADIUS.radius_25,
    flexDirection: 'row',
  },
  textInput: {
    width: '90%',
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  searchIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.space_10,
  },
});

export default InputHeader;
