# Dialog层级单例显示功能说明

## 功能描述
在现有的UI框架基础上，实现了Dialog层级只能同时显示一个UI的功能。当尝试打开新的Dialog时，会自动关闭当前已显示的Dialog，然后显示新的Dialog。

## 实现原理

### 核心改动
在 `LayerManager.ts` 中添加了以下关键功能：

1. **当前Dialog跟踪**
```typescript
/**当前显示的Dialog UI路径*/
private _currentDialogPath: string = "";
```

2. **Dialog打开检查**
在 `open` 方法中添加了Dialog层级的特殊处理逻辑：
```typescript
// 对于Dialog层级，检查是否已经有Dialog显示
if (layer === UILayer.Dialog && this._currentDialogPath) {
    // 先关闭当前的Dialog
    XKit.log.logBusiness(`Closing current dialog: ${this._currentDialogPath}`);
    // 同步关闭当前Dialog，不销毁，放入对象池
    this.close(this._currentDialogPath, false, true);
    this._currentDialogPath = "";
}
```

3. **Dialog关闭清理**
在 `_setupUIComponent` 和 `close` 方法中添加了Dialog路径的维护逻辑。

## 使用方法

### 基本使用
```typescript
// 打开Dialog（会自动处理单例逻辑）
const dialog = await XKit.gui.open({
    prefab: "prefabs/myDialog",
    layer: UILayer.Dialog,
    args: { title: "标题", content: "内容" },
    usePool: true  // 推荐使用对象池
});
```

### 连续打开多个Dialog
```typescript
// 连续调用会自动按顺序显示
await XKit.gui.open({
    prefab: "prefabs/dialog1",
    layer: UILayer.Dialog,
    args: { content: "第一个Dialog" }
});

// 这个调用会自动关闭第一个Dialog，然后显示第二个
await XKit.gui.open({
    prefab: "prefabs/dialog2", 
    layer: UILayer.Dialog,
    args: { content: "第二个Dialog" }
});
```

## 注意事项

1. **对象池使用**：建议为Dialog设置 `usePool: true`，这样关闭的Dialog会被回收到对象池而不是销毁，提高性能。

2. **动画处理**：关闭当前Dialog时使用了 `bSkipAnim: true` 参数，跳过关闭动画以实现快速切换。

3. **层级限制**：此功能仅对 `UILayer.Dialog` 层级生效，其他层级不受影响。

4. **自动管理**：整个过程完全自动化，开发者无需手动管理Dialog的关闭逻辑。

## 测试验证

项目中包含了测试脚本 `TestDialogSingleton.ts`，可以用来验证功能：

```typescript
// 连续测试三个Dialog的打开
const test = new TestDialogSingleton();
test.testDialogSingleton();

// 或者手动测试单个Dialog
test.openTestDialog(0); // 打开第一个
test.openTestDialog(1); // 打开第二个（会关闭第一个）
test.openTestDialog(2); // 打开第三个（会关闭第二个）
```

## 日志输出
功能会输出相关的业务日志，方便调试：
- Dialog关闭日志：`Closing current dialog: [path]`
- Dialog打开日志：`open: [path]`
- Dialog关闭日志：`close: [path]`

这个实现保持了原有框架的完整性和扩展性，同时满足了Dialog单例显示的需求。