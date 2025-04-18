import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

interface MovieCardProps {
  title: string;
  posterPath: string;
  releaseYear: string;
  rating: number;
  onPress: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  title,
  posterPath,
  releaseYear,
  rating,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <StyledView className="bg-white rounded-xl p-4 m-2 shadow-sm">
        <StyledImage
          source={{ uri: `https://image.tmdb.org/t/p/w500${posterPath}` }}
          className="w-full h-60 rounded-lg"
          resizeMode="cover"
        />
        <StyledView className="mt-2">
          <StyledText className="text-lg font-semibold" numberOfLines={1}>
            {title}
          </StyledText>
          <StyledView className="flex-row justify-between mt-1">
            <StyledText className="text-gray-600">{releaseYear}</StyledText>
            <StyledText className="text-yellow-500">★ {rating.toFixed(1)}</StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    </TouchableOpacity>
  );
}; 