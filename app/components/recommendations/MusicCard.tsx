import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

interface MusicCardProps {
  title: string;
  artist: string;
  albumArt: string;
  onPress: () => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({
  title,
  artist,
  albumArt,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <StyledView className="bg-white rounded-xl p-4 m-2 shadow-sm">
        <StyledImage
          source={{ uri: albumArt }}
          className="w-full h-40 rounded-lg"
          resizeMode="cover"
        />
        <StyledView className="mt-2">
          <StyledText className="text-lg font-semibold" numberOfLines={1}>
            {title}
          </StyledText>
          <StyledText className="text-gray-600" numberOfLines={1}>
            {artist}
          </StyledText>
        </StyledView>
      </StyledView>
    </TouchableOpacity>
  );
}; 