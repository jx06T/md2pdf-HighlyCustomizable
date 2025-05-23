import { visit } from 'unist-util-visit';

const zhNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const zhBigNums = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];

interface HeadingNumberingOptions {
  minDepth?: number; // 預設 1
  maxDepth?: number; // 預設 6
  style?: 'none'|'dot' | 'dash' | 'flat' | 'zh' | 'zh_big'; // 預設 'dot'
  separator?: string; // 預設 ' '
}

function numberToZh(num: number, big = false): string {
  // 單位數轉換，超過9不支援
  if (num < 0 || num > 9) return String(num);
  return big ? zhBigNums[num] : zhNums[num];
}

export function remarkHeadingNumbering(options: HeadingNumberingOptions = {}) {
  const {
    minDepth = 1,
    maxDepth = 6,
    style = 'dot',
    separator = ' ',
  } = options;

  return (tree: any) => {
    const counters = new Array(maxDepth).fill(0);

    visit(tree, 'heading', (node: any) => {
      if (style === 'none') return;
      const depth = node.depth;

      if (depth < minDepth || depth > maxDepth) {
        // 不在編號範圍內，跳過
        return;
      }

      // 當前層級計數 +1
      counters[depth - 1]++;

      // 清除比當前深度大的層級計數
      for (let i = depth; i < maxDepth; i++) {
        counters[i] = 0;
      }
      
      let numbering = '';
      
      switch (style) {
        case 'dot':
          // 從 minDepth 到當前深度，組合編號，用 '.' 串接
          numbering = counters
            .slice(minDepth - 1, depth)
            .filter(n => n > 0)
            .join('.');
          break;

        case 'dash':
          numbering = counters
            .slice(minDepth - 1, depth)
            .filter(n => n > 0)
            .join('-');
          break;

        case 'flat':
          // 只顯示本層編號，不包含父層編號
          numbering = counters[depth - 1].toString();
          break;

        case 'zh':
          numbering = numberToZh(counters[depth - 1], false);
          break;

        case 'zh_big':
          numbering = numberToZh(counters[depth - 1], true);
          break;

        default:
          numbering = counters
            .slice(minDepth - 1, depth)
            .filter(n => n > 0)
            .join('.');
      }

      // 在標題開頭插入編號 + separator
      node.children.unshift({
        type: 'text',
        value: numbering + separator,
      });
    });
  };
}
