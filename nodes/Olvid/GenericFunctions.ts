export function formatFileSize(bytes: bigint): string {
    const sizes = ['bytes', 'kB', 'MB', 'GB'];
    let sizeIndex = 0;
    let fileSize = Number(bytes);

    while (fileSize >= 1000 && sizeIndex < sizes.length - 1) {
        fileSize /= 1000;
        sizeIndex++;
    }

    const formattedSize = sizeIndex === 0 ? `${fileSize.toFixed(0)}` : `${fileSize.toFixed(2)}`;

    return `${formattedSize} ${sizes[sizeIndex]}`;
}
