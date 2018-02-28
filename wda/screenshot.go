//jasonxu-2017/11/22
package wda

import "encoding/json"

type ScreenShotInfo struct {
	Value  string `json:"value"`
	Status int    `json:"status"`
}

func (c *Client) ScreenShot() (*ScreenShotInfo, error) {
	resp, err := c.get("/screenShot")
	if err != nil {
		return nil, err
	}
	var ssi *ScreenShotInfo
	err = json.Unmarshal(resp, &ssi)
	if err != nil {
		return nil, err
	}
	return ssi, nil
}
