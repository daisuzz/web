import * as React from "react"
import {DateUtils} from "../DateUtils"
import {Box, Link, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableRow, Typography} from "@mui/material";
import {TabContext, TabList, TabPanel,} from "@mui/lab";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

interface BlogArticleTableProps {
    qiitaBlogs: ExternalBlog[]
    hatenaBlogs: ExternalBlog[]
}

export interface ExternalBlog {
    id: string
    link: string
    title: string
    publishedAt: string
}

const BlogTable: React.FC<BlogArticleTableProps> = ({qiitaBlogs, hatenaBlogs}) => {
    const [value, setValue] = React.useState('0');
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return (
        <TabContext value={value}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <TabList onChange={handleChange} aria-label="blog tabs" textColor={'inherit'}>
                    <Tab label="Hatena Blog" value="0"/>
                    <Tab label="Qiita" value="1"/>
                </TabList>
            </Box>
            <TabPanel value='0' sx={{padding: 0}}>
                <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                        <TableBody>
                            {hatenaBlogs.map(blog => {
                                const title = blog.title || blog.id
                                const publishedDate = DateUtils.formatDate(
                                    new Date(Date.parse(blog.publishedAt)),
                                    "YYYY年MM月DD日 hh:mm"
                                )
                                return (
                                    <TableRow key={blog.id}
                                              sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell align="left">
                                            <Typography variant="body1" sx={{
                                                margin: "10px auto"
                                            }}>
                                                <Link
                                                    component={"a"}
                                                    href={blog.link}
                                                    rel="noreferrer noopener"
                                                    target="_blank"
                                                    color="inherit"
                                                    underline="none"
                                                >
                                                    {title}
                                                </Link>
                                            </Typography>
                                            <Box sx={{display: {xs: 'flex', md: 'flex'}}}>
                                                <EventAvailableIcon fontSize="small"/>
                                                <Typography variant="body2" sx={{
                                                    margin: "auto auto auto 5px"
                                                }}>
                                                    {publishedDate}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>
            <TabPanel value='1' sx={{padding: 0}}>
                <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                        <TableBody>
                            {qiitaBlogs.map(blog => {
                                const title = blog.title || blog.id
                                const publishedDate = DateUtils.formatDate(
                                    new Date(Date.parse(blog.publishedAt)),
                                    "YYYY年MM月DD日 hh:mm"
                                )
                                return (
                                    <TableRow key={blog.id}
                                              sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell align="left">
                                            <Typography variant="body1" sx={{
                                                margin: "10px auto"
                                            }}>
                                                <Link
                                                    component={"a"}
                                                    href={blog.link}
                                                    rel="noreferrer noopener"
                                                    target="_blank"
                                                    color="inherit"
                                                    underline="none"
                                                >
                                                    {title}
                                                </Link>
                                            </Typography>
                                            <Box sx={{display: {xs: 'flex', md: 'flex'}}}>
                                                <EventAvailableIcon fontSize="small"/>
                                                <Typography variant="body2" sx={{
                                                    margin: "auto auto auto 5px"
                                                }}>
                                                    {publishedDate}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>
        </TabContext>
    )
}

export default BlogTable
