module Gacha (shuffleChars) where

import Data.Text (Text)
import qualified Data.Text as T
import System.Random (randomRIO)

-- 情報技術研究部の7文字
targetChars :: [Char]
targetChars = "情報技術研究部"

-- ランダムシャッフルして返す
shuffleChars :: IO Text
shuffleChars = T.pack <$> fisherYates targetChars

-- Fisher-Yatesシャッフル
fisherYates :: [a] -> IO [a]
fisherYates xs = go (length xs - 1) xs
  where
    go 0 arr = return arr
    go i arr = do
        j <- randomRIO (0, i)
        go (i - 1) (swap i j arr)

    swap i j arr =
        zipWith
            (\k v ->
                if k == i then arr !! j
                else if k == j then arr !! i
                else v)
            [0 ..] arr
