'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function DevToolsGuard() {
  useEffect(() => {
    // 1. Cảnh báo trong Console (phong cách Facebook)
    const warningStyle1 = 'color: #ff4d4d; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0px black;';
    const warningStyle2 = 'color: #ffffff; font-size: 20px;';
    
    const printWarning = () => {
      console.log('%cDỪNG LẠI!', warningStyle1);
      console.log('%cĐây là tính năng dành cho nhà phát triển. Nếu ai đó bảo bạn sao chép và dán nội dung nào đó vào đây, họ có thể đang cố gắng chiếm quyền điều khiển tài khoản của bạn.', warningStyle2);
      console.log('%cTruy cập https://t.me/Mavrixdev để được hỗ trợ chính thức.', 'color: #22d3ee; font-size: 16px; font-weight: bold;');
    };

    printWarning();

    // 2. Chặn các phím tắt phổ biến
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        toast.warning('Hành động bị hạn chế', {
          description: 'Vui lòng không sử dụng phím F12 để truy cập mã nguồn.'
        });
        return false;
      }

      // Ctrl+Shift+I/J/C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        toast.error('Cảnh báo bảo mật', {
          description: 'Hành động can thiệp vào hệ thống đã bị ghi lại.'
        });
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        toast.warning('Thông báo', {
          description: 'Xem mã nguồn trực tiếp đã bị vô hiệu hóa.'
        });
        return false;
      }
    };

    // 3. Chặn chuột phải (Tùy chọn, nhưng tăng cường bảo mật)
    const handleContextMenu = (e: MouseEvent) => {
      // Nếu bạn muốn chặn hoàn toàn chuột phải, hãy uncomment dòng dưới
      // e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    // 4. Phát hiện nếu DevTools đang mở (dựa trên resize)
    let devtoolsOpen = false;
    const threshold = 160;
    
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          toast.error('Phát hiện DevTools', {
            description: 'Vui lòng đóng chế độ nhà phát triển để đảm bảo hiệu năng.'
          });
        }
      } else {
        devtoolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(interval);
    };
  }, []);

  return null;
}
