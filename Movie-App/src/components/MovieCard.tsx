import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const MovieCard = (props: any) => {
  const { theme, colors } = useTheme();
  const backgroundColor = theme ? COLORS.BlackRGB10 : COLORS.Black;
  console.log(props.imagePath)
  return (
    <TouchableOpacity onPress={() => props.cardFunction()}>
      <View
        style={[
          styles.container,
          props.shoudlMarginatedAtEnd
            ? props.isFirst
              ? { marginLeft: SPACING.space_36 }
              : props.isLast
              ? { marginRight: SPACING.space_36 }
              : {}
            : {},
          props.shouldMarginatedAround ? { margin: SPACING.space_12 } : {},
          { maxWidth: props.cardWidth },
          { backgroundColor },
        ]}>
        {/* Wrap Image in a View to center it vertically */}
        <View style={styles.imageContainer}>
          <Image
            style={[
              styles.cardImage,
              { width: props.cardWidth, height: props.cardWidth * 1.5 },
            ]}
            source={{
              uri: props.imagePath || 'https://www.impawards.com/1994/posters/shawshank_redemption_ver1.jpg',
            }}
          />
        </View>

        <View>
          <View style={styles.rateContainer}>
            <Ionicons name="star" style={styles.starIcon} />
            <Text style={[styles.voteText, { color: colors.text }]}>
              {props.vote_average} ({props.vote_count})
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={[styles.textTitle, { color: colors.text }]}>
            {props.title}
          </Text>

          <View style={styles.genreContainer}>
            {props.genre.map((item: any) => (
              <View
                key={item}
                style={[styles.genreBox, { backgroundColor: colors.card }]}>
                <Text style={[styles.genreText, { color: colors.text }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black, // Default, overridden by theme
    borderRadius: BORDERRADIUS.radius_20,
    padding: SPACING.space_10,
  },
  imageContainer: {
    flex: 1, // Allow the container to take available space
    justifyContent: 'center', // Center the image vertically
    alignItems: 'center', // Center the image horizontally
  },
  cardImage: {
    aspectRatio: 2 / 3,
    borderRadius: BORDERRADIUS.radius_20,
  },
  textTitle: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
    textAlign: 'center',
    paddingVertical: SPACING.space_10,
  },
  rateContainer: {
    flexDirection: 'row',
    gap: SPACING.space_10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.space_10,
  },
  starIcon: {
    fontSize: FONTSIZE.size_20,
    color: COLORS.Yellow,
  },
  voteText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  genreContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.space_20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genreBox: {
    borderColor: COLORS.WhiteRGBA50,
    borderWidth: 1,
    paddingVertical: SPACING.space_4,
    paddingHorizontal: SPACING.space_10,
    borderRadius: BORDERRADIUS.radius_25,
  },
  genreText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
});

export default MovieCard;