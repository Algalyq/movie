import React, {useState} from 'react';
import { getApiUrl } from '../config/api';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import {COLORS, SPACING} from '../theme/theme';
import {baseImagePath} from '../api/apicalls';
import InputHeader from '../components/InputHeader';
import SubMovieCard from '../components/SubMovieCard';
import { useTranslation } from 'react-i18next';
const {width, height} = Dimensions.get('screen');
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
const SearchScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const [searchList, setSearchList] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const {colors, theme} = useTheme();

  const searchMoviesFunction = async (name: string) => {
    try {
      setError(null);
      if (!name.trim()) {
        setSearchList([]);
        return;
      }
  
      // Construct the base URL without the query
      const baseUrl = getApiUrl('/films/search/');
      // Append the query parameter separately
      const url = `${baseUrl}?query=${encodeURIComponent(name)}`;
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Server error');
      }
      const json = await response.json();
      setSearchList(json);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError(t('search.error'));
      setSearchList([]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar hidden />
      <FlatList
        data={searchList}
        keyExtractor={(item: any) => item.id.toString()}
        bounces={false}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.InputHeaderContainer}>
            <InputHeader searchFunction={searchMoviesFunction} />
          </View>
        }
        contentContainerStyle={[
          styles.centerContainer,
          searchList.length === 0 && styles.centerMessageContainer, // Center message when empty
        ]}
        ListEmptyComponent={
          <Text style={[styles.emptyMessage, { color: colors.text }]}>
            {error || (searchList.length === 0 ? t('search.typing') : t('search.noResults'))}
          </Text>
        }
        renderItem={({item}) => (
          <SubMovieCard
            shoudlMarginatedAtEnd={false}
            shouldMarginatedAround={true}
            cardFunction={() => {
              navigation.push('MovieDetails', {movieid: item.id, movie: item});
            }}
            cardWidth={width / 2 - SPACING.space_12 * 2}
            title={item.title}
            imagePath={item.poster_image}
          />
        )}
      />
    </SafeAreaView>
  );  
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    width,
    alignItems: 'center',
    backgroundColor: COLORS.Black,
  },
  InputHeaderContainer: {
    display: 'flex',
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_28,
    marginBottom: SPACING.space_28 - SPACING.space_12,
  },
  centerContainer: {
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.space_28,
  },
  centerMessageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default SearchScreen;
