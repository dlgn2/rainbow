import React, { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { ButtonPressAnimation } from '../animations';
import ImageAvatar from '../contacts/ImageAvatar';
import { Flex, InnerBorder } from '../layout';
import { Text } from '../text';
import { useAccountProfile, useRainbowProfile } from '@rainbow-me/hooks';
import styled from '@rainbow-me/styled-components';
import { position } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const AvatarCircleSize = 65;

const AvatarCircleView = styled(Flex)({
  ...position.sizeAsObject(AvatarCircleSize),
  alignItems: ios ? 'flex-start' : 'center',
  justifyContent: ios ? 'flex-start' : 'center',
  marginBottom: 16,
});

const FirstLetter = styled(Text).attrs(({ theme: { colors } }) => ({
  align: 'center',
  color: colors.whiteLabel,
  letterSpacing: 2,
  lineHeight: android ? 68 : 66,
  size: ios ? 38 : 30,
  weight: 'semibold',
}))({
  width: android ? 66 : 67,
});

export default function AvatarCircle({
  isAvatarPickerAvailable,
  onPress,
  overlayStyles,
  image,
  emoji,
  color,
  ...props
}) {
  const { colors, isDarkMode } = useTheme();
  const { accountAddress, accountColor, accountSymbol } = useAccountProfile();

  const { rainbowProfile } = useRainbowProfile(accountAddress);

  const avatarEmoji = emoji || accountSymbol || rainbowProfile?.emoji;
  const avatarColor =
    color || accountColor || rainbowProfile?.color || colors.skeleton;

  const shadows = useMemo(
    () => ({
      default: [
        [0, 2, 5, isDarkMode ? colors.trueBlack : colors.dark, 0.2],
        [
          0,
          6,
          10,
          isDarkMode ? colors.trueBlack : colors.alpha(avatarColor, 0.6),
        ],
      ],
      overlay: [
        [0, 6, 10, isDarkMode ? colors.trueBlack : colors.shadowBlack, 0.08],
        [0, 2, 5, isDarkMode ? colors.trueBlack : colors.shadowBlack, 0.12],
      ],
    }),
    [avatarColor, colors, isDarkMode]
  );

  return (
    <ButtonPressAnimation
      disabled={!isAvatarPickerAvailable}
      enableHapticFeedback={isAvatarPickerAvailable}
      marginTop={2}
      onPress={onPress}
      overflowMargin={30}
      pressOutDuration={200}
      scaleTo={isAvatarPickerAvailable ? 0.9 : 1}
      {...props}
    >
      <ShadowStack
        {...position.sizeAsObject(AvatarCircleSize)}
        backgroundColor={overlayStyles ? 'rgb(51, 54, 59)' : colors.white}
        borderRadius={AvatarCircleSize}
        marginBottom={12}
        shadows={shadows[overlayStyles ? 'overlay' : 'default']}
        {...(android && {
          height: 64,
          width: 64,
        })}
      >
        {image ? (
          <ImageAvatar image={image} size="large" />
        ) : (
          <AvatarCircleView backgroundColor={avatarColor}>
            <FirstLetter>{avatarEmoji}</FirstLetter>
            {!overlayStyles && <InnerBorder opacity={0.02} radius={65} />}
          </AvatarCircleView>
        )}
      </ShadowStack>
    </ButtonPressAnimation>
  );
}
