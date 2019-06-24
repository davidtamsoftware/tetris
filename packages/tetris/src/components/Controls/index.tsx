import * as React from "react";
import styles from "./index.module.css";

export const Controls = () => (<table className={styles.controls}>
  <tbody>
    <tr>
      <td colSpan={2}><h2>Controls</h2></td>
    </tr>
    <tr>
      <td>Rotate Left</td>
      <td>R.Shift</td>
    </tr>
    <tr>
      <td>Rotate Right</td>
      <td>&uarr;</td>
    </tr>
    <tr>
      <td>Move Left</td>
      <td>&larr;</td>
    </tr>
    <tr>
      <td>Move Right</td>
      <td>&rarr;</td>
    </tr>
    <tr>
      <td>Soft Drop</td>
      <td>&darr;</td>
    </tr>
    <tr>
      <td>Hard Drop</td>
      <td>Spacebar</td>
    </tr>
    <tr>
      <td>Pause/Resume</td>
      <td>Esc</td>
    </tr>
    <tr>
      <td><br /><br /></td>
      <td />
    </tr>
  </tbody>
</table>);